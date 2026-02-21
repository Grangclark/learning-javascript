// プログラムの最初の方に、合計を保持する変数を用意
let totalAmount = 0;

// データを貯めておくための「配列」を用意
let expenses = [];

let myChart = null; // グラフを上書きするために必要

// ページ読み込み時に実行
window.onload = function() {
    // ★ 今日の日付を初期値としてセットする
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
};

function addExpense() {
    const dateInput = document.getElementById('expense-date');
    const nameInput = document.getElementById('expense-name');
    const amountInput = document.getElementById('expense-amount');
    const categoryInput = document.getElementById('expense-category');

    // バリデーション（空チェック）に日付も追加
    if (!dateInput.value || !nameInput.value || !amountInput.value) {
        alert("日付、品目、金額をすべて入力してください");
        return;
    }

    // 新しい支出データを作成
    const expense = {
        id: Date.now(), // 削除用のユニークなIDとしては引き続きこれを使います
        date: dateInput.value, // ★ ユーザーが選んだ日付 ("2024-02-21" 形式)
        name: nameInput.value,
        amount: parseInt(amountInput.value),
        category: categoryInput.value
    };

    // 配列に追加して保存（ここでexpensesの一番上に支出データを保存している）
    expenses.unshift(expense);
    saveAndRender();

    // 入力欄をクリア（日付は残しておいたほうが連続入力しやすいのでそのまま）
    nameInput.value = "";
    amountInput.value = "";
}

function clearAll() {
    if (confirm("すべて消去しますか？")) {
        expenses = [];
        saveAndRender();
    }
}

// 倉庫に預ける ＆ 画面を書き換える
function saveAndRender() {
    localStorage.setItem('myExpenses', JSON.stringify(expenses)); // 配列を文字列にして保存
    renderExpenses();
}

// 配列の中身を元に、画面（HTML）を作る
function renderExpenses(data = expenses) {
    const list = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-amount');

    // カテゴリごとの表示場所を取得
    const catFoodDisp = document.getElementById('cat-food');
    const catDailyDisp = document.getElementById('cat-daily');
    const catSocialDisp = document.getElementById('cat-social');
    const catOtherDisp = document.getElementById('cat-other');

    list.innerHTML = "";
    totalAmount = 0;

    // カテゴリ別の合計を保持する変数
    let catTotals = { "食費": 0, "日用品": 0, "交際費": 0, "その他": 0 };

    data.forEach(expense => {
        // 総計への加算
        totalAmount += expense.amount;

        // カテゴリごとの加算
        catTotals[expense.category] += expense.amount;

        const li = document.createElement('li');

        // ★【ここがポイント】カテゴリ名をクラス名として追加する
        // 例：expense.categoryが「食費」なら class="cat-食費" になるように
        // わかりやすくするために、少し工夫してクラスを付けます
        const categoryClass = getCategoryClass(expense.category);
        li.classList.add(categoryClass);

        li.innerHTML = `
            <span>
                <small>[${expense.date}]</small> <small>[${expense.category}]</small>
                ${expense.name}
            </span>
            <span>¥${expense.amount.toLocaleString()}
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">x</button>
            </span>
        `;
        list.appendChild(li);
    });

    // 各表示を更新
    totalDisplay.innerText = totalAmount.toLocaleString();
    catFoodDisp.innerText = catTotals["食費"].toLocaleString();
    catDailyDisp.innerText = catTotals["日用品"].toLocaleString();
    catSocialDisp.innerText = catTotals["交際費"].toLocaleString();
    catOtherDisp.innerText = catTotals["その他"].toLocaleString();

    // 合計金額を表示した後にこれを追記！
    updateChart(catTotals);
}

// 削除機能も配列ベースに変更
function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveAndRender();
}

// ★ クラス名を判定する便利な関数を一番下などに追加
function getCategoryClass(category) {
    switch (category) {
        case '食費': return 'cat-food';
        case '日用品': return 'cat-daily';
        case '交際費': return 'cat-social';
        default: return 'cat-other';
    }
}

// 金額の大きい順（降順）に並べ替える関数
function sortByAmount() {
    // 1. 配列「expenses」の中身を並べ替える
    expenses.sort((a, b) => {
        // b（後ろの要素）から a（前の要素）を引いて、
        // プラスの結果ならbを前に持ってくる、というルールです
        return b.amount - a.amount;
    })

    // 2. 並べ替えた結果を画面に再描画する
    // 保存（localStorageへの書き込み）はせず、表示だけ変えるのがコツ！
    renderExpenses();
}

// フィルター用の関数
function filterExpenses() {
    const filterMonth = document.getElementById('filter-month').value; // "2024-02" みたいな形式で取得
    if (!filterMonth) return;

    // 1. 全データ(expenses)の中から、選んだ月と一致するものだけを抽出
    const filteredList = expenses.filter(expense => {
        // ★ ここを修正！IDではなく、保存した日付（expense.date）を使います
        // expense.date は "2024-03-21" のような形式なので、
        // 最初の7文字 ("2024-03") だけを切り取れば比較できます
        const expenseYearMonth = expense.date.substring(0, 7);

        return expenseYearMonth === filterMonth;
    })

    // 2. 抽出したリストだけで画面を描き直す
    renderExpenses(filteredList);
}

// フィルターをリセットする関数
function resetFilter() {
    document.getElementById('filter-month').value = "";
    renderExpenses(); // 引数なしで呼べば全データ表示（後述の修正が必要）
}

function updateChart(catTotals) {
    const ctx = document.getElementById('expense-chart').getContext('2d');

    // すでにグラフがあれば一旦壊す（新しく描き直すため）
    if (myChart) { myChart.destroy(); }

    myChart = new Chart(ctx, {
        type: 'pie', // 円グラフ
        data: {
            labels: Object.keys(catTotals), // カテゴリ名（食費、日用品など）
            datasets: [{
                data: Object.values(catTotals), // 合計金額の数字
                backgroundColor: ['#ff9f43', '#48dbfb', '#ff9ff3', '#54a0ff'] // 以前決めた色
            }]
        }
    });
}
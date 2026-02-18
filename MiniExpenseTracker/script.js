// プログラムの最初の方に、合計を保持する変数を用意
let totalAmount = 0;

// データを貯めておくための「配列」を用意
let expenses = [];

// 画面を読み込んだ時に、保存されたデータを呼び出す
window.onload = function() {
    const savedData = localStorage.getItem('myExpenses');
    if (savedData) {
        expenses = JSON.parse(savedData); // 文字列から配列に戻す
        renderExpenses(); // 画面に表示する
    }
};

function addExpense() {
    const nameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('item-amount');
    const categoryInput = document.getElementById('item-category'); // ★追加

    if (nameInput.value === "" || amountInput.value === "") return;

    // 新しい支出データを作成
    const newExpense = {
        id: Date.now(), // 削除する時に使うための固有ID
        name: nameInput.value,
        amount: Number(amountInput.value),
        category: categoryInput.value
    };

    // 配列に追加して保存（ここでexpensesの一番上に支出データを保存している）
    expenses.unshift(newExpense);
    saveAndRender();

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
function renderExpenses() {
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

    expenses.forEach(expense => {
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
            <span><small>[${expense.category}]</small> ${expense.name}</span>
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
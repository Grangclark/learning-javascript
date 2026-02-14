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

    // 配列に追加して保存
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

    list.innerHTML = "";
    totalAmount = 0;

    expenses.forEach(expense => {
        totalAmount += expense.amount;
        const li = document.createElement('li');
        li.innerHTML = `
            <span><small>[${expense.category}]</small> ${expense.name}</span>
            <span>¥${expense.amount.toLocaleString()}
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">x</button>
            </span>
        `;
        list.appendChild(li);
    });

    totalDisplay.innerText = totalAmount.toLocaleString();
}

// 削除機能も配列ベースに変更
function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveAndRender();
}


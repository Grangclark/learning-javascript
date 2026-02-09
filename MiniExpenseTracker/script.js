// プログラムの最初の方に、合計を保持する変数を用意
let totalAmount = 0;

function addExpense() {
    const nameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('item-amount');
    const list = document.getElementById('expense-list');
    
    const totalDisplay = document.getElementById('total-amount');

    if (nameInput.value === "" || amountInput.value === "") {
        alert("項目と金額を入力してください！")
        return;
    }

    // 1. 入力された金額を「数値」に変換する
    const amount = Number(amountInput.value);

    // 2. 合計変数に加算する
    totalAmount += amount;

    // 3. 画面の合計表示を更新する（カンマ区切りにする）
    totalDisplay.innerText = totalAmount.toLocaleString();

    // --- ここからは昨日と同じ ---
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${nameInput.value}</span>
        <span>${Number(amountInput.value).toLocaleString()}</span>
    `;
    list.prepend(li);

    nameInput.value = "";
    amountInput.value = "";
}
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

    const amount = Number(amountInput.value);

    // 1. リスト項目（li）を作る
    const li = document.createElement('li');

    // 2. 中身を作る（削除ボタンも一緒に！）
    li.innerHTML = `
        <span>${nameInput.value}</span>
        <span>${Number(amountInput.value).toLocaleString()}
            <button class="delete-btn">x</button>
        </span>
    `;

    // 3. 削除ボタンが押された時の処理
    li.querySelector('.delete-btn').onclick = function() {
        // 合計から引き算して表示を更新
        totalAmount -= amount;
        totalDisplay.innerText = totalAmount.toLocaleString();
        // 画面からこの1行を消す
        li.remove();
    }

    totalAmount += amount;
    totalDisplay.innerText = totalAmount.toLocaleString();
    list.prepend(li);
    nameInput.value = "";
    amountInput.value = "";
}
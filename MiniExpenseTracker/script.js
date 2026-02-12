// プログラムの最初の方に、合計を保持する変数を用意
let totalAmount = 0;

function addExpense() {
    const nameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('item-amount');
    const categoryInput = document.getElementById('item-category'); // ★追加
    const list = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total-amount');

    if (nameInput.value === "" || amountInput.value === "") return;

    const amount = Number(amountInput.value);

    const li = document.createElement('li');
    // ★ 表示内容に [カテゴリ] を追加
    li.innerHTML = `
        <span>
            <small style="color: #7f8c8d;">[${categoryInput.value}]</small>
            ${nameInput.value}
        </span>
        <span>¥${amount.toLocaleString()}
            <button class="delete-btn">x</button>
        </span>
    `;

    // 削除ボタンの処理はそのまま
    li.querySelector('.delete-btn').onclick = function() {
        totalAmount -= amount;
        totalDisplay.innerText = totalAmount.toLocaleString();
        li.remove();
    }

    totalAmount += amount;
    totalDisplay.innerText = totalAmount.toLocaleString();
    list.prepend(li);

    nameInput.value = "";
    amountInput.value = "";
}

function clearAll() {
    // 1. 念のための確認
    if (confirm("すべての支出データを消去してもよろしいですか？")) {
        // 2. 合計金額をゼロにする
        totalAmount = 0;
        document.getElementById('total-amount').innerText = "0";

        // 3. リストの中身を空っぽにする
        document.getElementById('expense-list').innerHTML = "";
    }
}
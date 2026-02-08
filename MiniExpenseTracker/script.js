function addExpense() {
    const nameInput = document.getElementById('item-name');
    const amountInput = document.getElementById('item-amount');
    const list = document.getElementById('expense-list');

    // 1. 入力された値が空じゃないかチェック
    if (nameInput.value === "" || amountInput.value === "") {
        alert("項目と金額を入力してください！")
        return;
    }

    // 2. 新しいリスト項目（li）を作る
    const li = document.createElement('li');

    // 3. 中身を組み立てる
    li.innerHTML = `
        <span>${nameInput.value}</span>
        <span>${Number(amountInput.value).toLocaleString()}</span>
    `;

    // 4. リストの一番上に追加する
    list.prepend(li);

    // 5. 入力欄を空にする
    nameInput.value = "";
    amountInput.value = "";
}
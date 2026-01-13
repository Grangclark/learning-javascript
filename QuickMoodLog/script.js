function updateCount() {
    const list = document.getElementById('log-list');
    // ulの中にあるliタグの数を数える
    const count = list.getElementsByTagName('li').length;
    document.getElementById('log-count').innerText = count;
}

function addLog(mood, color) { // colorを引数に追加
    // 1. 現在の時刻を取得（時計アプリの知識が活きます！）
    const now = new Date();
    const time = now.toLocaleTimeString();

    // 2. 新しいリスト項目（liタグ）を作成する
    const newLog = document.createElement('li');

    // 3. 中身に「時間」と「気分」を書き込む
    // newLog.innerText = `${time} : ${mood}`;

    // ★ ここを追加！
    // リストの文字色（style.color）を指定された色に変える
    newLog.style.color = color;
    // ついでに、左側にその色の太い線を引くとオシャレになります
    newLog.style.borderLeft = `5px solid ${color}`;

    // --- 2026/01/12 ---
    // --- ここから書き換え ---
    // 文字を表示するためのspan
    const textSpan = document.createElement('span');
    textSpan.innerText = `${time} : ${mood}`;

    // 削除ボタンを作る
    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = "x";
    deleteBtn.style.marginLeft = "10px";

    // ボタンが押されたら自分自身（li）を消す設定
    deleteBtn.onclick = function() {
        newLog.remove();
        updateCount(); // 消した後にカウントも更新！
    }

    // liの中に、文字とボタンを入れる
    newLog.appendChild(textSpan);
    newLog.appendChild(deleteBtn);
    // --- ここまで ---

    // 4. HTMLにある「ulタグ」の中に、作ったliタグをガチャンと合体させる
    const list = document.getElementById('log-list');
    list.prepend(newLog); // prependを使うと「一番上」に追加されます

    updateCount(); // ★追加：記録した後にカウント更新
}

function clearLogs() {
    // 1. 確認ダイアログを出す（うっかり削除防止）
    const confirmDelete = confirm("すべてのログを削除してもよろしいですか？");

    if (confirmDelete) {
        // 2. 本棚（ul）を取得して、その中身（innerHTML）を空文字にする
        const list = document.getElementById('log-list');
        list.innerHTML = "";

        updateCount(); // ★追加：削除した後にカウント更新
    }
}

function filterLogs() {
    const filterValue = document.getElementById('filter-mood').value;
    const listItems = document.getElementById('log-list').getElementsByTagName('li');

    // リストにある全ての li タグを、上から順番に1つずつチェックしていきます
    for (let i = 0; i < listItems.length; i++) {
        const item = listItems[i];
        // リスト内のテキストに、選択した気分が含まれているかチェック
        // 「すべて表示」か、その他のfilterValueに一致した場合、表示とする
        if (filterValue === "all" || item.innerText.includes(filterValue)) {
            item.style.display = ""; // 表示する
        } else {
            item.style.display = "none"; // 非表示にする
        }
    }
}
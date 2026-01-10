function addLog(mood, color) { // colorを引数に追加
    // 1. 現在の時刻を取得（時計アプリの知識が活きます！）
    const now = new Date();
    const time = now.toLocaleTimeString();

    // 2. 新しいリスト項目（liタグ）を作成する
    const newLog = document.createElement('li');

    // 3. 中身に「時間」と「気分」を書き込む
    newLog.innerText = `${time} : ${mood}`;

    // ★ ここを追加！
    // リストの文字色（style.color）を指定された色に変える
    newLog.style.color = color;
    // ついでに、左側にその色の太い線を引くとオシャレになります
    newLog.style.borderLeft = `5px solid ${color}`;

    // 4. HTMLにある「ulタグ」の中に、作ったliタグをガチャンと合体させる
    const list = document.getElementById('log-list');
    list.prepend(newLog); // prependを使うと「一番上」に追加されます
}

function clearLogs() {
    // 1. 確認ダイアログを出す（うっかり削除防止）
    const confirmDelete = confirm("すべてのログを削除してもよろしいですか？");

    if (confirmDelete) {
        // 2. 本棚（ul）を取得して、その中身（innerHTML）を空文字にする
        const list = document.getElementById('log-list');
        list.innerHTML = "";
    }
}
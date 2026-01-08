function addLog(mood) {
    // 1. 現在の時刻を取得（時計アプリの知識が活きます！）
    const now = new Date();
    const time = now.toLocaleTimeString();

    // 2. 新しいリスト項目（liタグ）を作成する
    const newLog = document.createElement('li');

    // 3. 中身に「時間」と「気分」を書き込む
    newLog.innerText = `${time} : ${mood}`;

    // 4. HTMLにある「ulタグ」の中に、作ったliタグをガチャンと合体させる
    const list = document.getElementById('log-list');
    list.prepend(newLog); // prependを使うと「一番上」に追加されます
}
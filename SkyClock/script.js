function updateClock() {
    // 1. 現在の時刻データを取得
    const now = new Date();

    // 2. 「時・分・秒」をそれぞれ取り出す
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 3. 画面に表示する文字列を作る
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').innerText = timeString;

    // 4. 【応用】時間帯によって背景色を変える
    let color = "";
    let msg = "";

    if (hours >= 5 && hours < 11) {
        color = "#ff9a9e"; // 朝：ピンク系
        msg = "おはようございます！";
    } else if (hours >= 11 && hours < 17) {
        color = "#84fab0"; // 昼：グリーン系
        msg = "こんにちは！";
    } else if (hours >= 17 && hours < 20) {
        color = "#fa709a"; // 夕方：オレンジ・夕焼け系
        msg = "こんばんは！";
    } else {
        color = "#30336b"; // 夜：深夜・ネイビー系
        msg = "お疲れ様です、夜更かしはほどほどに。";
    }

    document.body.style.backgroundColor = color;
    document.getElementById('message').innerText = msg;
}

// 5. １秒（1000ミリ秒）ごとにupdateClock関数を実行する
setInterval(updateClock, 1000);

// 最初に一度実行して、表示の空白を防ぐ
updateClock();
function updateClock() {
    // 1. 現在の時刻データを取得
    const now = new Date();

    // 2. 「時・分・秒」をそれぞれ取り出す
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 3. 画面に表示する文字列を作る（機能追加：時計の「：」の部分を、1秒ごとに表示したり消したりする）
    // ★ ここを書き換え！
    // 秒が偶数の時は「:」、奇数の時は「 」（半角スペース）にする
    const separator = now.getSeconds() % 2 === 0 ? ":" : " ";
    const timeString = `${hours}${separator}${minutes}${separator}${seconds}`;

    document.getElementById('clock').innerText = timeString;

    // 4. 【応用】時間帯によって背景色を変える
    let color = "";
    let msg = "";

    if (hours >= 5 && hours < 11) {
        // 朝：明るいオレンジからピンクへ
        color = "linear-gradient(120deg, #f6d365 0%, #fda085 100%)";
        msg = "おはようございます！";
    } else if (hours >= 11 && hours < 17) {
        // 昼：爽やかな青空
        color = "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)";
        msg = "こんにちは！";
    } else if (hours >= 17 && hours < 20) {
        // 夕方：夕焼けの紫とオレンジ
        color = "linear-gradient(120deg, #f093fb 0%, #f5576c 100%)";
        msg = "こんばんは！";
    } else {
        // 夜：深い夜空
        color = "linear-gradient(120deg, #243949 0%, #517fa4 100%)";
        msg = "お疲れ様です、ゆっくり休みましょう。";
    }

    // backgroundColor ではなく background に代入します
    document.body.style.background = color;
    document.getElementById('message').innerText = msg;
}

// 5. １秒（1000ミリ秒）ごとにupdateClock関数を実行する
setInterval(updateClock, 1000);

// 最初に一度実行して、表示の空白を防ぐ
updateClock();
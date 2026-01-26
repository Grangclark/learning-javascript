let timeLeft = 25 * 60; // 25分を秒単位に変換（1500秒）
let timerId = null;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // 秒が10未満の時、頭に「0」を付けて「09」のように表示する（パディング）
    const displaySeconds = seconds < 10 ? '0' + seconds : seconds;
    
    document.getElementById('timer-display').innerText = `${minutes}:${displaySeconds}`;
}

function startTimer() {
    // すでに動いている場合は二重にスタートしないようにする
    if (timerId !== null) return;

    timerId = setInterval(() => {
        timeLeft--; // 1秒減らす
        updateDisplay(); // 画面を更新
        
        if (timeLeft <= 0) {
            clearInterval(timerId); // 0になったら止める
            alert("お疲れ様です！休憩しましょう。");
        }
    }, 1000); // 1000ミリ秒（＝1秒）ごとに実行
}
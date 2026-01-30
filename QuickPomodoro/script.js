let timeLeft = 0.1 * 60; // 25分を秒単位に変換（１５００秒）
let timerId = null;
let isWorkTime = true; // 今が集中時間ならtrue、休憩時間ならfalse

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // 秒が10未満の時、頭に「0」を付けて「09」のように表示する（パディング）
    const displaySeconds = seconds < 10 ? '0' + seconds : seconds;

    document.getElementById('timer-display').innerText = `${minutes}:${displaySeconds}`;

    // 今のモードを表示する（HTMLにあとでid="mode-status"を追加します）
    const statusText = isWorkTime ? "💻 集中タイム" : "☕ 休憩タイム";
    document.getElementById('mode-status').innerText = statusText;
}

function startTimer() {
    // すでに動いている場合は二重にスタートしないようにする
    if (timerId !== null) return;

    timerId = setInterval(() => {
        timeLeft--; // １秒減らす
        updateDisplay(); // 画面を更新

        if (timeLeft <= 0) {
            clearInterval(timerId); // 0になったら止める
            timerId = null;

            // ★ モードを入れ替える魔法
            isWorkTime = !isWorkTime;

            // 次の時間をセット（集中なら25分、休憩なら5分）
            timeLeft = isWorkTime ? 25 * 60 : 5 * 60;

            updateDisplay();

            setTimeout(() => {
                alert(isWorkTime ? "休憩終了！仕事に戻りましょう！" : "集中終了！休憩しましょう！");
            }, 100);
        }
    }, 1000); // １０００ミリ秒（＝１秒）ごとに実行
}

// ストップ機能
function stopTimer() {
    clearInterval(timerId); // 動いているタイマーを止める
    timerId = null; // 「止まっているよ」という印を付ける
}

// リセット機能
function resetTimer() {
    stopTimer(); // まずは止める
    timeLeft = 25 * 60; // 時間を25分に戻す
    updateDisplay(); // 表示を「25:00」に更新する
    isWorkTime = true; // リセットしたら集中モードに戻す
}
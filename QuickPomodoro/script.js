let timeLeft = 0.1 * 60; // 25分を秒単位に変換（１５００秒）
let timerId = null;
let isWorkTime = true; // 今が集中時間ならtrue、休憩時間ならfalse
const finishSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // 秒が10未満の時、頭に「0」を付けて「09」のように表示する（パディング）
    const displaySeconds = seconds < 10 ? '0' + seconds : seconds;

    // 現在の残り時間を文字列にする
    const timeString = `${minutes}:${displaySeconds}`;

    document.getElementById('timer-display').innerText = timeString;

    // 今のモードを表示する（HTMLにあとでid="mode-status"を追加します）
    const statusText = isWorkTime ? "💻 集中タイム" : "☕ 休憩タイム";
    document.getElementById('mode-status').innerText = statusText;

    // ★【今日の本番】タブのタイトルを書き換える！
    // 例：「(25:00) 💻 集中 | Quick Pomodoro」のような表示になります
    document.title = `(${timeString}) ${statusText} | Quick Pomodoro`;

    // ★ ここを追加：モードに合わせてBodyのクラスを入れ替える
    if (isWorkTime) {
        document.body.classList.add('work-mode');
        document.body.classList.remove('break-mode');
    } else {
        document.body.classList.add('break-mode');
        document.body.classList.remove('work-mode');
    }
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

            // ★ ここで音を鳴らす！
            finishSound.play();

            // 集中が終わった時だけスタンプを追加
            if (isWorkTime) {
                addStamp();
            }

            // ★ モードを入れ替える魔法
            isWorkTime = !isWorkTime;

            // 次の時間をセット（集中なら25分、休憩なら5分）
            // timeLeft = isWorkTime ? 25 * 60 : 5 * 60;
            timeLeft = isWorkTime ? 0.5 * 60 : 0.5 * 60;

            updateDisplay();

            setTimeout(() => {
                alert(isWorkTime ? "休憩終了！仕事に戻りましょう！" : "集中終了！お見事です！🍅！");
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

// スタンプを追加する関数
function addStamp() {
    const list = document.getElementById('stamps-list');
    const stamp = document.createElement('span');
    stamp.innerText = '🍅'; // トマトスタンプ！
    list.appendChild(stamp);

    // ★ 画面上のトマトの数を数えて、数字を書き換える（この1行を足すだけ）
    document.getElementById('stamp-count').innerText = list.children.length;
}

function clearStamps() {
    // ユーザーに確認をとる（うっかり消し防止）
    if (confirm("今日の成果（スタンプ）をリセットしますか？")) {
        const list = document.getElementById('stamps-list');

        // ★ 中身を空の文字列にするだけで、スタンプが全部消えます
        list.innerHTML = "";

        // ★ 数字を「0」に戻す（この1行を足すだけ）
        document.getElementById('stamp-count').innerText = "0"    
    }
}
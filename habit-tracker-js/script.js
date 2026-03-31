// 1. 今日が何日か取得して表示する
const today = new Date().toLocaleDateString();
document.getElementById('today-date').innerText = today;

// 2. 完了ボタンの要素を「id」で取得する（ここが重要！）
const checkBtn = document.getElementById('check-btn');

// 3. ボタンがクリックされたら実行する処理
checkBtn.addEventListener('click', () => {
    // 【最優先】今日すでに押していたら、何もせず終了する（ガード句）
    const lastSavedDate = localStorage.getItem('lastHabitDate');
    // if (lastSavedDate === today) return; 

    // 1. データの更新
    let count = parseInt(localStorage.getItem('habitCount')) || 0;
    count++;
    localStorage.setItem('habitCount', count);
    localStorage.setItem('lastHabitDate', today); // 日付を保存！

    // 2. ストリークの更新（昨日の日付と比較）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    const lastDate = localStorage.getItem('lastHabitDate'); // 前回の保存日

    let streak = parseInt(localStorage.getItem('habitStreak')) || 0;
    if (lastDate === yesterdayStr) {
        streak++;
    } else {
        streak = 1;
    }
    localStorage.setItem('habitStreak', streak);

    // 3. 画面の表示を更新（ストリーク、合計回数、ボタン）

    const countDisplay = document.querySelector('p'); // 合計回数の表示場所を捕まえる
    if (countDisplay) countDisplay.innerText = `合計達成回数：${count}回`; // 画面の数字を最新にする

    let streakDisplay = document.querySelector('.streak-msg');
    if (!streakDisplay) {
        streakDisplay = document.createElement('p');
        streakDisplay.className = 'streak-msg';
        document.body.appendChild(streakDisplay);
    }
    streakDisplay.innerText = `現在 ${streak} 日連続達成中！ 🔥`;

    checkBtn.innerText = "完了しました";
    checkBtn.style.backgroundColor = "#ccc";
    checkBtn.disabled = true;

    // 4. お祝いメッセージの作成（古いのは消す）
    const oldMsg = document.querySelector('.congrats-msg');
    if (oldMsg) oldMsg.remove();

    const messageArea = document.createElement('div');
    messageArea.className = 'congrats-msg';

    // test
    // streak = 30;

    // 20日の特別演出
    if (streak === 20) {
        messageArea.innerText = '✨ 祝・20日継続！もはやプロの習慣化エンジニアですね！ ✨';
        messageArea.style.backgroundColor = '#fff3b0';
        messageArea.style.border = '2px solid orange';
        messageArea.style.padding = '10px';
        messageArea.style.borderRadius = '8px';
        messageArea.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        messageArea.style.textAlign = 'center';
        messageArea.style.margin = '20px auto';
        messageArea.style.maxWidth = '300px';
        messageArea.style.lineHeight = '1.6';
        messageArea.style.color = '#856404';
    } else if (streak >= 30) {
        messageArea.innerText = '1ヶ月達成！神の領域です！👑';
    } else if (streak >= 10) {
        messageArea.innerText = '10日突破！習慣のプロですね！✨';
    } else if (streak >= 7) {
        messageArea.innerText = '1週間継続中！すごい！👏';
    } else {
        messageArea.innerText = `現在 ${streak} 日目！明日も頑張ろう！`;
    }

    document.body.appendChild(messageArea);

    // 5. 最後の演出（凹みと完了メッセージ）
    checkBtn.style.transform = "scale(0.95)";
    checkBtn.style.boxShadow = "none";
    const finishMsg = document.createElement('div');
    finishMsg.innerText = "✨ 本日のミッション完了！お疲れ様でした ✨";
    document.body.appendChild(finishMsg);
});

// 1. 保存されている回数を取得（なければ0）
const initialCount = localStorage.getItem('habitCount') || 0;

// 2. 画面上のpタグを捕まえて、回数を書き込む
const countDisplay = document.querySelector('p');
if (countDisplay) countDisplay.innerText = `合計達成回数：${initialCount}回`;

// ★ 今日の新しい4行：ページを開いた瞬間にストリークを表示する
const currentStreak = localStorage.getItem('habitStreak') || 0;
const streakDisplay = document.createElement('p');
streakDisplay.className = 'streak-msg';
streakDisplay.innerText = `現在 ${currentStreak} 日連続達成中！ 🔥`;
document.body.appendChild(streakDisplay);
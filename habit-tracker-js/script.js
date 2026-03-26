// 1. 今日が何日か取得して表示する
const today = new Date().toLocaleDateString();
document.getElementById('today-date').innerText = today;

// 2. 完了ボタンの要素を「id」で取得する（ここが重要！）
const checkBtn = document.getElementById('check-btn');

// 3. ボタンがクリックされたら実行する処理
checkBtn.addEventListener('click', () => {
    // 1. ボタンの文字を変える
    checkBtn.innerText = "完了しました";
    // 2. ボタンの色をグレー（お休み色）に変える
    checkBtn.style.backgroundColor = "#ccc";
    // 3. ボタンを無効化して、2回押せないようにする
    checkBtn.disabled = true;

    // ★ 今日の新しい3行：時間を記録する
    const now = new Date().toLocaleString();
    localStorage.setItem('lastHabitDate', now);
    console.log("保存完了！：", now);

    // 1. 保存された日付を読み出す
    const savedDate = localStorage.getItem('lastHabitDate');

    // 2. もしデータがあれば、ボタンを完了状態にする
    if (savedDate === new Date().toLocaleDateString()) {
        checkBtn.innerText = "完了済み！";
        checkBtn.disabled = true;
    }

    // ★ 今日の新しい3行：達成回数をカウントする
    let count = parseInt(localStorage.getItem('habitCount')) || 0;
    count++;
    localStorage.setItem('habitCount', count);

    // 保存された回数を読み出して、画面に表示する
    const savedCount = localStorage.getItem('habitCount') || 0;
    const statusMsg = `合計達成回数：${savedCount}回`;
    // document.body.insertAdjacentHTML('beforeend', `<p>${statusMsg}</p>`);

    // ★ 今日の4行：昨日の日付を計算して、連続達成か確認する
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    const lastDate = localStorage.getItem('lastHabitDate');

    // ★ 今日の新しい4行：昨日の日付と一致するかでストリークを更新する
    let streak = parseInt(localStorage.getItem('habitStreak')) || 0;

    if (lastDate === yesterdayStr) {
        streak++;
    } else {
        streak = 1;
    }

    // テスト用
    streak = 20;

    localStorage.setItem('habitStreak', streak);

    // ★ 今日の新しい4行：既存の表示を探して、スマートに更新する
    let streakDisplay = document.querySelector('.streak-msg');
    if (!streakDisplay) {
        streakDisplay = document.createElement('p');
        streakDisplay.className = 'streak-msg';
        document.body.appendChild(streakDisplay);
    }
    streakDisplay.innerText = `現在 ${streak} 日連続達成中！ 🔥`;

    // ★ 今日の新しい4行：古いメッセージがあれば消してから、新しく作る
    const oldMsg = document.querySelector('.congrats-msg');
    if (oldMsg) {
        oldMsg.remove();
    }    

    // ★ 今日の新しい4行：特定の回数で「おめでとう」を出す準備
    const messageArea = document.createElement('div');
    messageArea.className = 'congrats-msg';

    // ★ 今日の新しい4行：20日記念の特別演出を追加
    if (streak === 20) {
        messageArea.innerText = '✨ 祝・20日継続！もはやプロの習慣化エンジニアですね！ ✨';
        messageArea.style.backgroundColor = '#fff3b0'; // 背景を少しリッチな色に
        messageArea.style.border = '2px solid orange'; // 枠線を付けて目立たせる

        // ★ 今日の新しい4行：20日記念メッセージをさらに豪華にする
        messageArea.style.padding = '10px';
        messageArea.style.borderRadius = '8px';
        messageArea.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        messageArea.style.textAlign = 'center';

        // ★ 今日の新しい4行：20日記念メッセージをモダンなカードデザインにする
        messageArea.style.margin = '20px auto';
        messageArea.style.maxWidth = '300px';
        messageArea.style.lineHeight = '1.6';
        messageArea.style.color = '#856404'; // 深みのあるゴールド系の文字色
    }

    // ★ 今日の新しい4行：10日、30日など節目のメッセージを追加する
    if (streak >= 30) messageArea.innerText = '1ヶ月達成！神の領域です！👑';
    else if (streak >= 20) ;
    else if (streak >= 10) messageArea.innerText = '10日突破！習慣のプロですね！✨';
    else if (streak >= 7) messageArea.innerText = '1週間継続中！すごい！👏';
    else messageArea.innerText = `現在 ${streak} 日目！明日も頑張ろう！`;
    
    document.body.appendChild(messageArea);

    // ★ 今日の新しい4行：メッセージに「動き」のきっかけを与える
    messageArea.classList.add('fade-in');
    if (streak >= 3) {
        messageArea.style.fontSize = "20px";
        messageArea.style.fontWeight = "bold";
    }

    // ★ 今日の新しい3行：クリックした瞬間に、画面上の数字を最新にする
    const countDisplay = document.querySelector('p');
    if (countDisplay) countDisplay.innerText = `合計達成回数：${count}回`;
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
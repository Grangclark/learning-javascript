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
    document.body.insertAdjacentHTML('beforeend', `<p>${statusMsg}</p>`);

    // ★ 今日の新しい3行：クリックした瞬間に、画面上の数字を最新にする
    const countDisplay = document.querySelector('p');
    if (countDisplay) countDisplay.innerText = `合計達成回数：${count}回`;
});

// 1. 保存されている回数を取得（なければ0）
const initialCount = localStorage.getItem('habitCount') || 0;

// 2. 画面上のpタグを捕まえて、回数を書き込む
const countDisplay = document.querySelector('p');
if (countDisplay) countDisplay.innerText = `合計達成回数：${initialCount}回`;
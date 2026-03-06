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
});
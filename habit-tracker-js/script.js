// 1. 今日が何日か取得して表示する
const today = new Date().toLocaleDateString();
document.getElementById('today-date').innerText = today;

// 2. 完了ボタンの要素を「id」で取得する（ここが重要！）
const checkBtn = document.getElementById('check-btn');

// 3. ボタンがクリックされたら実行する処理
checkBtn.addEventListener('click', () => {
    console.log("今日もお疲れ様！習慣チェック完了！");
});
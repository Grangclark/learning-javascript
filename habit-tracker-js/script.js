// 1. 今日が何日か取得して表示する
const today = new Date().toLocaleDateString();
document.getElementById('today-date').innerText = today;

// 2. 完了ボタンの要素だけ取っておく（明日の準備）
const checkBtn = document.getElementById('check-btn');
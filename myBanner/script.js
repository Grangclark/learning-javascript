const testBtn = document.getElementById('test-btn');

testBtn.addEventListener('click', () => {
    const myBanner = document.createElement('div');
    myBanner.innerText = "拡張機能テスト中";
    document.body.appendChild(myBanner);
    myBanner.style.transform = "scale(1.2)";

    // ★ 追加の4行：バナーを画面のど真ん中に固定する
    myBanner.style.position = "fixed";
    myBanner.style.top = "50%";
    myBanner.style.left = "50%";
    myBanner.style.translate = "-50% -50%";
});
const testBtn = document.getElementById('test-btn');

testBtn.addEventListener('click', () => {
    const myBanner = document.createElement('div');
    myBanner.innerText = "拡張機能テスト中";
    document.body.appendChild(myBanner);
    myBanner.style.transform = "scale(1.2)";
});
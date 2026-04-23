// content.js：ボタンの作成とクリック処理をシンプルに分離する
setInterval(() => {
    const existingBtn = document.getElementById('pixiv-dl-btn');
    if (location.host === 'www.pixiv.net' && !existingBtn) {
        const dlBtn = document.createElement('button');
        dlBtn.id = 'pixiv-dl-btn';
        dlBtn.innerText = "画像を保存";
        dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
        
        // ★ クリック時の処理を、ボタン作成の直後に確実に繋ぐ
        dlBtn.onclick = () => {
            const img = document.querySelector('main [role="presentation"] img');
            if (img) {
                chrome.runtime.sendMessage({ message: "download", url: img.src }, (res) => console.log(res));
            } else {
                alert("画像が見つかりません。クリックして画像を開いていますか？");
            }
        };
        document.body.appendChild(dlBtn);
    }
}, 1000);
console.log("PixivImageDownloader、起動しました！");
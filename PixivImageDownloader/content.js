// content.js：pixivに専用の保存ボタンを出す
if (location.host === 'www.pixiv.net') {
    const dlBtn = document.createElement('button');
    dlBtn.innerText = "画像を保存";
    dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
    document.body.appendChild(dlBtn);
}
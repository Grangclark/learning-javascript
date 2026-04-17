// content.js：ボタンがない時だけ作成して追加する
setInterval(() => {
    if (location.host === 'www.pixiv.net' && !document.getElementById('pixiv-dl-btn')) {
        const dlBtn = document.createElement('button');
        dlBtn.id = 'pixiv-dl-btn'; // 重複防止用のID
        dlBtn.innerText = "画像を保存";
        dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
        document.body.appendChild(dlBtn);

        // ★ 今日の5行：表示されているメイン画像を特定する
        // ★ 修正後の1行：属性を [ ] で囲むのが正解！
        const mainImage = document.querySelector('main [role="presentation"] img');
        if (mainImage) {
            console.log("画像を発見！:", mainImage.src);
            const imageUrl = mainImage.src;
            // ここに将来、ダウンロードの魔法を繋げます
        }
    }
}, 1000); // 1秒ごとにチェック
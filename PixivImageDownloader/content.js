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
            // ★ 今日の5行：ボタンが押されたらダウンロードを実行する
            // content.js：ボタンが押された瞬間に、改めて最新の画面から画像を探す
            dlBtn.onclick = () => {
                // ボタンを押した瞬間に、現在の画面に img があるか探しに行く
                const mainImage = document.querySelector('main [role="presentation"] img');
                
                if (mainImage) {
                    console.log("画像を発見しました！:", mainImage.src);
                    chrome.runtime.sendMessage({ message: "download", url: mainImage.src });
                } else {
                    alert("まだ画像が読み込まれていないか、見つかりません。");
                }
            };
        }
    }
}, 1000); // 1秒ごとにチェック
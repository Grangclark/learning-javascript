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
            // ★ 今日の修正：メッセージが届いたか確認する機能を追加
            dlBtn.onclick = () => {
                const mainImage = document.querySelector('main [role="presentation"] img');
                if (mainImage) {
                    chrome.runtime.sendMessage({ message: "download", url: mainImage.src }, (response) => {
                        console.log("裏側（background）からの返事:", response);
                    });
                }
            };
        }
    }
}, 1000); // 1秒ごとにチェック
console.log("PixivImageDownloader、起動しました！");
// content.js：background に「強奪」を依頼し、届いたデータを受け取って保存する
setInterval(() => {
    const existingBtn = document.getElementById('pixiv-dl-btn');
    if (location.host === 'www.pixiv.net' && !existingBtn) {
        const dlBtn = document.createElement('button');
        dlBtn.id = 'pixiv-dl-btn';
        dlBtn.innerText = "画像を保存";
        dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
        
        dlBtn.onclick = () => {
            const img = document.querySelector('main [role="presentation"] img');
            if (!img) return alert("画像が見つかりません");

            // background.js に「身代わり取得」を依頼
            chrome.runtime.sendMessage({ message: "download_blob", url: img.src }, (response) => {
                if (response.error) return alert("強奪失敗: " + response.error);

                // 届いたBase64データをダウンロード
                const a = document.createElement('a');
                a.href = response.dataUrl;
                a.download = "pixiv_image.jpg";
                a.click();
                console.log("最終作戦、成功！");
            });
        };
        document.body.appendChild(dlBtn);
    }
}, 1000);
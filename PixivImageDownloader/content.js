// content.js：Fetch API を使って自力で画像を「強奪」する
setInterval(() => {
    const existingBtn = document.getElementById('pixiv-dl-btn');
    if (location.host === 'www.pixiv.net' && !existingBtn) {
        const dlBtn = document.createElement('button');
        dlBtn.id = 'pixiv-dl-btn';
        dlBtn.innerText = "画像を保存";
        dlBtn.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999; padding:10px; background:#0096fa; color:#fff; border:none; border-radius:5px; cursor:pointer;";
        
        dlBtn.onclick = async () => {
            const img = document.querySelector('main [role="presentation"] img');
            if (!img) return alert("画像が見つかりません");

            try {
                // 1. Fetchで画像データを直接「強奪」する
                const response = await fetch(img.src);
                const blob = await response.blob(); // 2. 生のデータ（Blob）に変換
                
                // 3. メモリ上に一時的なURLを作成
                const blobUrl = window.URL.createObjectURL(blob);
                
                // 4. 見えないリンクを作って、勝手にクリック（ダウンロード）させる
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = "pixiv_image.jpg";
                a.click();
                
                // 5. 使い終わったメモリを解放
                window.URL.revokeObjectURL(blobUrl);
                console.log("強奪成功！");
            } catch (err) {
                console.error("強奪失敗:", err);
                alert("データの取得に失敗しました。");
            }
        };
        document.body.appendChild(dlBtn);
    }
}, 1000);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download_blob") {
        fetch(request.url, {
            headers: { "Referer": "https://www.pixiv.net/" }
        })
        .then(response => {
            if (!response.ok) throw new Error("ネットワーク応答が異常です");
            return response.blob();
        })
        .then(blob => {
            const reader = new FileReader();
            // ★ 確実に読み込みが終わってから送る
            reader.onload = () => {
                console.log("梱包完了（サイズ）:", reader.result.length); 
                sendResponse({ dataUrl: reader.result });
            };
            reader.onerror = () => sendResponse({ error: "ファイルの読み込みに失敗しました" });
            reader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error("Fetchエラー:", error);
            sendResponse({ error: error.message });
        });
        return true; 
    }
});
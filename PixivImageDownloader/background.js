// background.js：特権権限で画像を fetch し、Base64形式で content.js へ届ける
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download_blob") {
        fetch(request.url, {
            headers: { "Referer": "https://www.pixiv.net/" }
        })
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => sendResponse({ dataUrl: reader.result });
            reader.readAsDataURL(blob); // BlobをBase64文字列に変換して送る
        })
        .catch(error => sendResponse({ error: error.message }));
        return true; // 非同期通信を維持
    }
});
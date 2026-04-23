// background.js：伝言を受け取って、確実に返事をする
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("メッセージを受信しました:", request);
    
    if (request.message === "download") {
        chrome.downloads.download({ 
            url: request.url, 
            filename: "pixiv_image.jpg" 
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                sendResponse("エラー発生: " + chrome.runtime.lastError.message);
            } else {
                sendResponse("ダウンロードを開始したよ！ ID: " + downloadId);
            }
        });
    }
    return true; // ★ 非同期通信を維持するために絶対必要
});
// background.js：リファラを偽装してダウンロードを成功させる
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download") {
        // ダウンロード命令を出す
        chrome.downloads.download({
            url: request.url,
            filename: "pixiv_image.jpg",
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("DLエラー:", chrome.runtime.lastError.message);
                sendResponse("失敗: " + chrome.runtime.lastError.message);
            } else {
                sendResponse("成功！ ID: " + downloadId);
            }
        });
    }
    return true;
});
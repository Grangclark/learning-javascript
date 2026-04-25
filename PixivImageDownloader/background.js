// background.js：URLをコンソールに出して、リファラ偽装ルールを適用する
chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: {
            type: "modifyHeaders",
            requestHeaders: [{ header: "Referer", operation: "set", value: "https://www.pixiv.net/" }]
        },
        condition: { urlFilter: "pximg.net", resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame", "image", "other"] }
    }]
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download") {
        // ★ ここで受け取ったURLをコンソールに表示します
        console.log("【受領】保存を開始するURL:", request.url);

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
// background.js：あらゆる身分証を pixiv に書き換えて、門番を突破する
chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: {
            type: "modifyHeaders",
            requestHeaders: [
                // 1. 「pixivのページ内から来ました」という証明
                { header: "Referer", operation: "set", value: "https://www.pixiv.net/" },
                // 2. 「pixivというサイトがリクエストしています」という証明
                { header: "Origin", operation: "set", value: "https://www.pixiv.net" },
                // 3. ブラウザに「リファラを隠さないで！」と強制する
                { header: "Referrer-Policy", operation: "set", value: "no-referrer-when-downgrade" }
            ]
        },
        condition: { 
            urlFilter: "pximg.net", 
            resourceTypes: ["xmlhttprequest", "main_frame", "sub_frame", "image", "other"] 
        }
    }]
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "download") {
        console.log("【最終作戦開始】URL:", request.url);
        chrome.downloads.download({
            url: request.url,
            filename: "pixiv_image.jpg",
            saveAs: false
        }, (id) => {
            if (chrome.runtime.lastError) {
                sendResponse("失敗: " + chrome.runtime.lastError.message);
            } else {
                sendResponse("成功！ ID: " + id);
            }
        });
    }
    return true;
});
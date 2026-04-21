// background.js：伝言を受け取って、実際にPCへ保存する
chrome.runtime.onMessage.addListener((request) => {
    if (request.message === "download") {
        chrome.downloads.download({
            url: request.url,
            filename: "pixiv_image.jpg" // ★ 保存時のファイル名を指定
        });
    }
});
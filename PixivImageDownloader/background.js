// background.js：伝言を受け取ってダウンロードを実行する
chrome.runtime.onMessage.addListener((request) => {
    if (request.message === "download") {
        chrome.downloads.download({ url: request.url });
    }
});
// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 既存の板一覧取得
    if (request.action === "fetch_bbs") {
        fetch("https://www2.5ch.io/5ch.html")
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const decoder = new TextDecoder("shift_jis");
                sendResponse({ success: true, data: decoder.decode(buffer) });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    // ★【今日新しく追加】指定された板のスレッド一覧（subback.html）を取得する
    if (request.action === "fetch_threads") {
        fetch(request.url) // script.jsから送られてきた subback.html のURL
            .then(response => {
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                return response.arrayBuffer();
            })
            .then(buffer => {
                const decoder = new TextDecoder("shift_jis");
                sendResponse({ success: true, data: decoder.decode(buffer) });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});
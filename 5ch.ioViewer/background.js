// background.js：Shift_JISを正しく翻訳して送る
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetch_bbs") {
        fetch("https://www2.5ch.io/5ch.html")
            .then(response => {
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                // ★テキストではなく、一度生のバイナリデータ（ArrayBuffer）として受け取る
                return response.arrayBuffer();
            })
            .then(buffer => {
                // ★「Shift_JIS」として日本語を正しくデコード（翻訳）する
                const decoder = new TextDecoder("shift_jis");
                const htmlText = decoder.decode(buffer);
                
                sendResponse({ success: true, data: htmlText });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true;
    }
});
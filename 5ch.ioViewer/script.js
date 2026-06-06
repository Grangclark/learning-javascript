// script.js

// 1. 板一覧を取得して画面に表示する（最初の画面）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    // ★【ここがポイント】板一覧に戻ってきたら、戻るボタンは必要ないので隠す
    document.getElementById("back-btn").style.display = "none";
    document.querySelector("h3").innerText = "5ch.io 板一覧";

    chrome.runtime.sendMessage({ action: "fetch_bbs" }, (response) => {
        const listContainer = document.getElementById("bbs-list");
        if (!response || !response.success) {
            listContainer.innerText = "板一覧の取得に失敗しました。";
            return;
        }

        listContainer.innerHTML = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, "text/html");
        const links = doc.querySelectorAll("a");

        links.forEach(link => {
            const href = link.getAttribute("href");
            const text = link.innerText.trim();

            if (href && text) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                
                a.href = href;
                a.innerText = text;

                a.addEventListener("click", (e) => {
                    e.preventDefault(); 
                    fetchThreadList(href); 
                });

                li.appendChild(a);
                listContainer.appendChild(li);
            }
        });
    });
}

// 2. スレッド一覧を表示する（遷移後の画面）
function fetchThreadList(boardUrl) {
    const baseUrl = boardUrl.endsWith("/") ? boardUrl : boardUrl + "/";
    const subbackUrl = baseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    // ★【ここがポイント】スレッド一覧画面になったら、戻るボタンを表示する
    document.getElementById("back-btn").style.display = "block";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            const links = doc.querySelectorAll("a");

            listContainer.innerHTML = "";
            document.querySelector("h3").innerText = "5ch.io スレッド一覧";

            links.forEach(link => {
                const href = link.getAttribute("href"); 
                const text = link.innerText.trim();

                if (href && text) {
                    const li = document.createElement("li");
                    const a = document.createElement("a");

                    // 昨日作成した完璧なURL変換ロジック
                    const urlObj = new URL(baseUrl); 
                    const serverName = urlObj.hostname.split('.')[0]; 
                    const boardName = urlObj.pathname.replace(/\//g, ""); 
                    const threadId = href.split("/")[0]; 

                    a.href = `https://itest.5ch.io/${serverName}/test/read.cgi/${boardName}/${threadId}`;
                    a.innerText = text;
                    a.target = "_blank"; 

                    li.appendChild(a);
                    listContainer.appendChild(li);
                }
            });

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// ★【今日新しく追加】戻るボタンをクリックした時のイベントを設定
document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; // 一瞬待機文字を出す
    fetchBbsList(); // 最初の板一覧関数を再実行するだけ！
});

// 最初の起動
fetchBbsList();
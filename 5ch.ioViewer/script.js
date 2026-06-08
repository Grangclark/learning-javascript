// script.js

// ★【今日新しく追加】スレッドの元データを一時保存するためのグローバル変数
let currentThreadLinks = []; 
let currentBaseUrl = "";

function displayHistory() {
    chrome.storage.local.get(["threadHistory"], (result) => {
        const historyList = document.getElementById("history-list");
        const historySection = document.getElementById("history-section");
        const history = result.threadHistory || [];

        if (history.length === 0) {
            historySection.style.display = "none";
            return;
        }

        historySection.style.display = "block";
        historyList.innerHTML = "";

        history.forEach(item => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = item.url;
            a.innerText = item.title;
            a.target = "_blank";
            li.appendChild(a);
            historyList.appendChild(li);
        });
    });
}

function saveToHistory(title, url) {
    chrome.storage.local.get(["threadHistory"], (result) => {
        let history = result.threadHistory || [];
        history = history.filter(item => item.url !== url);
        history.unshift({ title: title, url: url });
        history = history.slice(0, 5);

        chrome.storage.local.set({ threadHistory: history }, () => {
            displayHistory();
        });
    });
}

// 1. 板一覧を取得して画面に表示する
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    // ★板一覧に戻ったら検索窓も隠して、入力文字をリセットする
    document.getElementById("search-container").style.display = "none";
    document.getElementById("search-input").value = "";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
    displayHistory();

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

// 2. スレッド一覧を表示する
function fetchThreadList(boardUrl) {
    currentBaseUrl = boardUrl.endsWith("/") ? boardUrl : boardUrl + "/";
    const subbackUrl = currentBaseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    document.getElementById("history-section").style.display = "none";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            
            // ★【ここがポイント】集めたリンクのデータを、後で検索するために変数に保存しておく
            currentThreadLinks = Array.from(doc.querySelectorAll("a"));

            // ★検索窓を表示する
            document.getElementById("search-container").style.display = "block";

            // 最初はキーワード空っぽ（全件表示）で描画する
            renderThreadList("");

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// ★【今日新しく追加】スレッド一覧を画面に「描画」する専用の関数
function renderThreadList(keyword) {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "";
    document.querySelector("h3").innerText = "5ch.io スレッド一覧";

    // 検索ワードを英小文字に統一（大文字小文字を区別せずに検索するため）
    const lowerKeyword = keyword.toLowerCase();

    currentThreadLinks.forEach(link => {
        const href = link.getAttribute("href"); 
        const text = link.innerText.trim();

        if (href && text) {
            // ★【今日の一撃】検索キーワードが含まれているかチェック（空文字の場合は常にtrue）
            if (text.toLowerCase().includes(lowerKeyword)) {
                const li = document.createElement("li");
                const a = document.createElement("a");

                const urlObj = new URL(currentBaseUrl); 
                const serverName = urlObj.hostname.split('.')[0]; 
                const boardName = urlObj.pathname.replace(/\//g, ""); 
                const threadId = href.split("/")[0]; 

                const finalUrl = `https://itest.5ch.io/${serverName}/test/read.cgi/${boardName}/${threadId}`;
                
                a.href = finalUrl;
                a.innerText = text;
                a.target = "_blank"; 

                a.addEventListener("click", () => {
                    saveToHistory(text, finalUrl);
                });

                li.appendChild(a);
                listContainer.appendChild(li);
            }
        }
    });
}

// ★【今日新しく追加】検索窓に文字が入力されるたびに、即座に絞り込むイベント
document.getElementById("search-input").addEventListener("input", (e) => {
    const keyword = e.target.value;
    renderThreadList(keyword); // 入力された文字を渡して再描画
});

// 戻るボタンのイベント
document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; 
    fetchBbsList(); 
});

// 最初の起動
fetchBbsList();
// script.js

let currentThreadLinks = []; 
let currentBaseUrl = "";

// 履歴表示（既存）
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

// 履歴保存（既存）
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

// お気に入り板の表示（既存）
function displayFavBoards() {
    chrome.storage.local.get(["favBoards"], (result) => {
        const favList = document.getElementById("fav-boards-list");
        const favSection = document.getElementById("fav-boards-section");
        const favBoards = result.favBoards || [];

        if (favBoards.length === 0) {
            favSection.style.display = "none";
            return;
        }

        favSection.style.display = "block";
        favList.innerHTML = "";

        favBoards.forEach(board => {
            const li = document.createElement("li");
            li.className = "list-item-container";

            const a = document.createElement("a");
            a.href = board.url;
            a.innerText = board.title;
            a.addEventListener("click", (e) => {
                e.preventDefault();
                fetchThreadList(board.url); 
            });

            const span = document.createElement("span");
            span.className = "fav-btn";
            span.innerText = "★";
            span.addEventListener("click", () => {
                toggleFavBoard(board.title, board.url, span);
                setTimeout(fetchBbsList, 50); 
            });

            li.appendChild(a);
            li.appendChild(span);
            favList.appendChild(li);
        });
    });
}

// お気に入り板のトグル（既存）
function toggleFavBoard(title, url, btnElement) {
    chrome.storage.local.get(["favBoards"], (result) => {
        let favBoards = result.favBoards || [];
        const isExist = favBoards.some(board => board.url === url);

        if (isExist) {
            favBoards = favBoards.filter(board => board.url !== url);
            btnElement.innerText = "☆";
        } else {
            favBoards.push({ title: title, url: url });
            btnElement.innerText = "★";
        }

        chrome.storage.local.set({ favBoards: favBoards }, () => {
            displayFavBoards();
        });
    });
}


// ==========================================
// ★【今日新しく追加】お気に入りスレッドの管理機能
// ==========================================

// ① お気に入りスレッドを読み込んでトップページに表示する関数
function displayFavThreads() {
    chrome.storage.local.get(["favThreads"], (result) => {
        const favList = document.getElementById("fav-threads-list");
        const favSection = document.getElementById("fav-threads-section");
        const favThreads = result.favThreads || [];

        if (favThreads.length === 0) {
            favSection.style.display = "none";
            return;
        }

        favSection.style.display = "block";
        favList.innerHTML = "";

        favThreads.forEach(thread => {
            const li = document.createElement("li");
            li.className = "list-item-container";

            const a = document.createElement("a");
            a.href = thread.url;
            a.innerText = thread.title;
            a.target = "_blank"; // お気に入りスレをクリックしたら一発で新規タブ起動！

            // お気に入りエリア内の解除用★ボタン
            const span = document.createElement("span");
            span.className = "fav-btn";
            span.innerText = "★";
            span.addEventListener("click", () => {
                toggleFavThread(thread.title, thread.url, span);
            });

            li.appendChild(a);
            li.appendChild(span);
            favList.appendChild(li);
        });
    });
}

// ② お気に入りスレッドの「登録 / 解除」を切り替える関数
function toggleFavThread(title, url, btnElement) {
    chrome.storage.local.get(["favThreads"], (result) => {
        let favThreads = result.favThreads || [];
        const isExist = favThreads.some(thread => thread.url === url);

        if (isExist) {
            favThreads = favThreads.filter(thread => thread.url !== url);
            btnElement.innerText = "☆";
        } else {
            favThreads.push({ title: title, url: url });
            btnElement.innerText = "★";
        }

        chrome.storage.local.set({ favThreads: favThreads }, () => {
            displayFavThreads();
        });
    });
}


// 1. 板一覧を取得して画面に表示する（修正）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("search-input").value = "";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
    // ★トップページにお気に入り（板・スレ）と履歴をすべて呼び出す
    displayFavBoards();
    displayFavThreads();
    displayHistory();

    chrome.runtime.sendMessage({ action: "fetch_bbs" }, (response) => {
        const listContainer = document.getElementById("bbs-list");
        if (!response || !response.success) {
            listContainer.innerText = "板一覧の取得に失敗しました。";
            return;
        }

        chrome.storage.local.get(["favBoards"], (result) => {
            const favBoards = result.favBoards || [];
            listContainer.innerHTML = "";

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            const links = doc.querySelectorAll("a");

            links.forEach(link => {
                let href = link.getAttribute("href");
                const text = link.innerText.trim();

                if (href && text) {
                    // ★【安全強化】一部の特殊な板ドメインの揺らぎを安全に正規化
                    if (href.startsWith("//")) href = "https:" + href;

                    const li = document.createElement("li");
                    li.className = "list-item-container";

                    const a = document.createElement("a");
                    a.href = href;
                    a.innerText = text;
                    a.addEventListener("click", (e) => {
                        e.preventDefault(); 
                        fetchThreadList(href); 
                    });

                    const span = document.createElement("span");
                    span.className = "fav-btn";
                    
                    const isFav = favBoards.some(board => board.url === href);
                    span.innerText = isFav ? "★" : "☆";

                    span.addEventListener("click", () => {
                        toggleFavBoard(text, href, span);
                    });

                    li.appendChild(a);
                    li.appendChild(span);
                    listContainer.appendChild(li);
                }
            });
        });
    });
}

// 2. スレッド一覧を表示する（修正）
function fetchThreadList(boardUrl) {
    // 末尾のスラッシュの有無や特殊ドメインを安全にパースする強化パッチ
    let sanitizedBoardUrl = boardUrl.startsWith("//") ? "https:" + boardUrl : boardUrl;
    currentBaseUrl = sanitizedBoardUrl.endsWith("/") ? sanitizedBoardUrl : sanitizedBoardUrl + "/";
    const subbackUrl = currentBaseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    document.getElementById("history-section").style.display = "none";
    document.getElementById("fav-boards-section").style.display = "none";
    // ★スレ一覧画面に移ったら、お気に入りスレッドエリアも一時的に隠す
    document.getElementById("fav-threads-section").style.display = "none";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            
            currentThreadLinks = Array.from(doc.querySelectorAll("a"));
            document.getElementById("search-container").style.display = "block";

            renderThreadList("");

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// スレッドの描画（修正）
function renderThreadList(keyword) {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "";
    document.querySelector("h3").innerText = "5ch.io スレッド一覧";

    const lowerKeyword = keyword.toLowerCase();

    // スレッド側のお気に入り状況をロード
    chrome.storage.local.get(["favThreads"], (result) => {
        const favThreads = result.favThreads || [];

        currentThreadLinks.forEach(link => {
            const href = link.getAttribute("href"); 
            const text = link.innerText.trim();

            if (href && text) {
                if (text.toLowerCase().includes(lowerKeyword)) {
                    const li = document.createElement("li");
                    li.className = "list-item-container"; // スレッド側も横並びデザインを適用

                    const a = document.createElement("a");

                    // ★【安全強化】URLの分解ロジックをどんな5chドメインでも壊れないように強化
                    const urlObj = new URL(currentBaseUrl); 
                    const serverName = urlObj.hostname.split('.')[0]; 
                    const boardName = urlObj.pathname.split('/').filter(Boolean)[0] || ""; 
                    const threadId = href.split("/")[0]; 

                    const finalUrl = `https://itest.5ch.io/${serverName}/test/read.cgi/${boardName}/${threadId}`;
                    
                    a.href = finalUrl;
                    a.innerText = text;
                    a.target = "_blank"; 

                    a.addEventListener("click", () => {
                        saveToHistory(text, finalUrl);
                    });

                    // ★【今日の一撃】スレッド用の☆ボタンを作成
                    const span = document.createElement("span");
                    span.className = "fav-btn";
                    
                    // すでにお気に入りに登録されているスレURLなら最初から「★」
                    const isFav = favThreads.some(thread => thread.url === finalUrl);
                    span.innerText = isFav ? "★" : "☆";

                    span.addEventListener("click", () => {
                        toggleFavThread(text, finalUrl, span);
                    });

                    li.appendChild(a);
                    li.appendChild(span); // スレタイの右側に星を配置
                    listContainer.appendChild(li);
                }
            }
        });
    });
}

// 検索イベント（既存）
document.getElementById("search-input").addEventListener("input", (e) => {
    const keyword = e.target.value;
    renderThreadList(keyword); 
});

// 戻るボタンのイベント（既存）
document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; 
    fetchBbsList(); 
});

// 最初の起動
fetchBbsList();
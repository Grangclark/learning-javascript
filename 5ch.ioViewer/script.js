// script.js

// ★【今日新しく追加】板の一覧データを一時保存するためのグローバル変数
let currentBbsLinks = []; 
let currentThreadLinks = []; 
let currentBaseUrl = "";
let currentSortMode = "default"; 

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

// お気に入りスレッドの表示（既存）
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
            a.target = "_blank";

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

// お気に入りスレッドのトグル（既存）
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

// 勢い計算（既存）
function calculateMomentum(href, text) {
    const resMatch = text.match(/\((\d+)\)$/);
    if (!resMatch) return 0;
    const resCount = parseInt(resMatch[1], 10);

    const threadId = href.split("/")[0];
    const createdTime = parseInt(threadId, 10) * 1000;
    if (isNaN(createdTime)) return 0;

    const now = Date.now();
    const diffDays = Math.max((now - createdTime) / (1000 * 60 * 60 * 24), 0.1);

    return resCount / diffDays;
}


// 1. 板一覧を取得して画面に表示する（修正）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("sort-container").style.display = "none";
    
    // ★板一覧画面に戻ったら、板検索窓を表示する
    document.getElementById("board-search-container").style.display = "block";
    document.getElementById("search-input").value = "";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
    displayFavBoards();
    displayFavThreads();
    displayHistory();

    // すでにデータを取得済みなら、ネットワーク通信をスキップして再描画（爆速化）
    if (currentBbsLinks.length > 0) {
        renderBbsList(document.getElementById("board-search-input").value);
        return;
    }

    chrome.runtime.sendMessage({ action: "fetch_bbs" }, (response) => {
        const listContainer = document.getElementById("bbs-list");
        if (!response || !response.success) {
            listContainer.innerText = "板一覧の取得に失敗しました。";
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, "text/html");
        
        // ★【ここがポイント】落としてきた全「板」のリンクデータを配列に記憶
        currentBbsLinks = Array.from(doc.querySelectorAll("a"));

        // 初回描画（現在の入力キーワードを反映）
        renderBbsList(document.getElementById("board-search-input").value);
    });
}

// ★【今日新しく追加】「板一覧」を画面に絞り込み描画する専用の関数
function renderBbsList(keyword) {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "";
    const lowerKeyword = keyword.toLowerCase();

    chrome.storage.local.get(["favBoards"], (result) => {
        const favBoards = result.favBoards || [];

        currentBbsLinks.forEach(link => {
            let href = link.getAttribute("href");
            const text = link.innerText.trim();

            if (href && text) {
                // 入力文字が含まれているか検品（空文字なら全件パス）
                if (text.toLowerCase().includes(lowerKeyword)) {
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
            }
        });
        
        if (listContainer.children.length === 0) {
            listContainer.innerText = "一致する板が見つかりません。";
        }
    });
}


// 2. スレッド一覧を表示する（修正）
function fetchThreadList(boardUrl) {
    let sanitizedBoardUrl = boardUrl.startsWith("//") ? "https:" + boardUrl : boardUrl;
    currentBaseUrl = sanitizedBoardUrl.endsWith("/") ? sanitizedBoardUrl : sanitizedBoardUrl + "/";
    
    const subbackUrl = currentBaseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    document.getElementById("history-section").style.display = "none";
    document.getElementById("fav-boards-section").style.display = "none";
    document.getElementById("fav-threads-section").style.display = "none";
    // ★スレッド一覧画面に移ったら、板検索窓は一時的に隠す
    document.getElementById("board-search-container").style.display = "none";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            
            currentThreadLinks = Array.from(doc.querySelectorAll("a"));
            
            document.getElementById("search-container").style.display = "block";
            document.getElementById("sort-container").style.display = "flex";

            updateSortButtons("default");
            renderThreadList("");

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// スレッドの描画（既存）
function renderThreadList(keyword) {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "";
    document.querySelector("h3").innerText = "5ch.io スレッド一覧";

    const lowerKeyword = keyword.toLowerCase();

    chrome.storage.local.get(["favThreads"], (result) => {
        const favThreads = result.favThreads || [];

        let filteredLinks = currentThreadLinks.filter(link => {
            const text = link.innerText.trim();
            return text.toLowerCase().includes(lowerKeyword);
        });

        if (currentSortMode === "momentum") {
            filteredLinks.sort((a, b) => {
                const momentumA = calculateMomentum(a.getAttribute("href"), a.innerText);
                const momentumB = calculateMomentum(b.getAttribute("href"), b.innerText);
                return momentumB - momentumA; 
            });
        }

        filteredLinks.forEach(link => {
            const href = link.getAttribute("href"); 
            const text = link.innerText.trim();

            if (href && text) {
                const li = document.createElement("li");
                li.className = "list-item-container";

                const a = document.createElement("a");

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

                const span = document.createElement("span");
                span.className = "fav-btn";
                
                const isFav = favThreads.some(thread => thread.url === finalUrl);
                span.innerText = isFav ? "★" : "☆";

                span.addEventListener("click", () => {
                    toggleFavThread(text, finalUrl, span);
                });

                li.appendChild(a);
                li.appendChild(span);
                listContainer.appendChild(li);
            }
        });
    });
}

// ソートボタン切り替え（既存）
function updateSortButtons(mode) {
    currentSortMode = mode;
    if (mode === "default") {
        document.getElementById("sort-default-btn").disabled = true;
        document.getElementById("sort-momentum-btn").disabled = false;
    } else {
        document.getElementById("sort-default-btn").disabled = false;
        document.getElementById("sort-momentum-btn").disabled = true;
    }
}

// ソートボタンイベント（既存）
document.getElementById("sort-default-btn").addEventListener("click", () => {
    updateSortButtons("default");
    renderThreadList(document.getElementById("search-input").value);
});

document.getElementById("sort-momentum-btn").addEventListener("click", () => {
    updateSortButtons("momentum");
    renderThreadList(document.getElementById("search-input").value);
});

// ★【今日新しく追加】板検索窓に文字が入力されるたびに即座に絞り込むイベント
document.getElementById("board-search-input").addEventListener("input", (e) => {
    const keyword = e.target.value;
    renderBbsList(keyword);
});

// スレッド検索イベント（既存）
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
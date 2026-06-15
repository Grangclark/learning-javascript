// script.js

let currentBbsLinks = []; 
let currentThreadLinks = []; 
let currentBaseUrl = "";
let currentSortMode = "default"; 

// 1. 履歴表示（既存のまま）
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

// 2. 履歴保存（既存のまま）
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

// 3. お気に入り板の表示（既存のまま）
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

// 4. お気に入り板のトグル（既存のまま）
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

// 5. お気に入りスレッドの表示（既存のまま）
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

// 6. お気に入りスレッドのトグル（既存のまま）
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

// 7. 勢い計算（既存のまま）
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

// 8. 板一覧を取得して画面に表示する（既存のまま）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    document.getElementById("sort-container").style.display = "none";
    document.getElementById("board-search-container").style.display = "block";
    document.getElementById("search-input").value = "";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
    displayFavBoards();
    displayFavThreads();
    displayHistory();

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
        currentBbsLinks = Array.from(doc.querySelectorAll("a"));
        renderBbsList(document.getElementById("board-search-input").value);
    });
}

// 9. 板一覧の描画（既存のまま）
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

// 10. スレッド一覧を表示する（既存のまま）
function fetchThreadList(boardUrl) {
    let sanitizedBoardUrl = boardUrl.startsWith("//") ? "https:" + boardUrl : boardUrl;
    currentBaseUrl = sanitizedBoardUrl.endsWith("/") ? sanitizedBoardUrl : sanitizedBoardUrl + "/";
    
    const subbackUrl = currentBaseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    document.getElementById("history-section").style.display = "none";
    document.getElementById("fav-boards-section").style.display = "none";
    document.getElementById("fav-threads-section").style.display = "none";
    document.getElementById("board-search-container").style.display = "none";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            
            const rawTitle = doc.querySelector("title") ? doc.querySelector("title").innerText : "";
            const boardNameText = rawTitle.replace(/＠.*/, "").replace("スレッド一覧", "").trim();

            currentThreadLinks = Array.from(doc.querySelectorAll("a"));
            
            document.getElementById("search-container").style.display = "block";
            document.getElementById("sort-container").style.display = "flex";

            updateSortButtons("default");
            renderThreadList("", boardNameText);

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// 11. スレッドの描画（★ここで大掃除・バグを完全駆逐！）
function renderThreadList(keyword, boardName = "") {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "";
    
    if (boardName) {
        document.querySelector("h3").innerText = `${boardName} スレッド一覧`;
    }

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
                const boardNameId = urlObj.pathname.split('/').filter(Boolean)[0] || ""; 
                const threadId = href.split("/")[0]; 

                const finalUrl = `https://itest.5ch.io/${serverName}/test/read.cgi/${boardNameId}/${threadId}`;
                
                a.href = finalUrl;
                a.innerText = text;
                a.target = "_blank"; 

                // 🔔【大掃除の一撃】ここに移動したことで、どんなルートから描画されても、
                // 検索・ソートされても、100%確実にクリック時に履歴に保存されるようになりました！
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

// 12. 各種イベントリスナー（既存のまま）
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

document.getElementById("sort-default-btn").addEventListener("click", () => {
    updateSortButtons("default");
    renderThreadList(document.getElementById("search-input").value);
});

document.getElementById("sort-momentum-btn").addEventListener("click", () => {
    updateSortButtons("momentum");
    renderThreadList(document.getElementById("search-input").value);
});

document.getElementById("board-search-input").addEventListener("input", (e) => {
    renderBbsList(e.target.value);
});
document.getElementById("board-search-input").addEventListener("search", (e) => {
    renderBbsList(e.target.value); 
});

document.getElementById("search-input").addEventListener("input", (e) => {
    renderThreadList(e.target.value); 
});
document.getElementById("search-input").addEventListener("search", (e) => {
    renderThreadList(e.target.value); 
});

document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; 
    fetchBbsList(); 
});

// 最初の起動
fetchBbsList();
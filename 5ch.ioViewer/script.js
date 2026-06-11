// script.js

let currentThreadLinks = []; 
let currentBaseUrl = "";
let currentSortMode = "default"; // "default" または "momentum"

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

// ★【今日新しく追加】スレッドの「勢い」を数式に基づいて計算する関数
function calculateMomentum(href, text) {
    // 1. スレタイの末尾の (502) のような文字から数字だけを引っこ抜く
    const resMatch = text.match(/\((\d+)\)$/);
    if (!resMatch) return 0;
    const resCount = parseInt(resMatch[1], 10); // 総レス数 (例: 502)

    // 2. href ("1779968763/") から誕生時刻のタイムスタンプを取得
    const threadId = href.split("/")[0];
    const createdTime = parseInt(threadId, 10) * 1000; // ミリ秒に変換
    if (isNaN(createdTime)) return 0;

    // 3. 現在時刻との差分から「経過日数」を計算 (最低でも0.1日として計算し、ゼロ除算を防ぐ)
    const now = Date.now();
    const diffDays = Math.max((now - createdTime) / (1000 * 60 * 60 * 24), 0.1);

    // 4. 勢い ＝ 総レス数 ÷ 経過日数
    return resCount / diffDays;
}


// 1. 板一覧を取得して画面に表示する（修正）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("search-container").style.display = "none";
    // ★板一覧に戻ったらソートボタンエリアも隠す
    document.getElementById("sort-container").style.display = "none";
    document.getElementById("search-input").value = "";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
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
    // ★【履歴バグ修正パッチ】お気に入り板から飛んできた時も、確実に安全にURLを検知・記憶させる
    let sanitizedBoardUrl = boardUrl.startsWith("//") ? "https:" + boardUrl : boardUrl;
    currentBaseUrl = sanitizedBoardUrl.endsWith("/") ? sanitizedBoardUrl : sanitizedBoardUrl + "/";
    
    const subbackUrl = currentBaseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    document.getElementById("history-section").style.display = "none";
    document.getElementById("fav-boards-section").style.display = "none";
    document.getElementById("fav-threads-section").style.display = "none";

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");
            
            currentThreadLinks = Array.from(doc.querySelectorAll("a"));
            
            // ★画面遷移時に検索窓とソートボタンを出現させる
            document.getElementById("search-container").style.display = "block";
            document.getElementById("sort-container").style.display = "flex";

            // ソート状態をデフォルトに戻して描画
            updateSortButtons("default");
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

    chrome.storage.local.get(["favThreads"], (result) => {
        const favThreads = result.favThreads || [];

        // 1. 現在のリストをコピーして、検索キーワードに一致するものだけに絞り込む
        let filteredLinks = currentThreadLinks.filter(link => {
            const text = link.innerText.trim();
            return text.toLowerCase().includes(lowerKeyword);
        });

        // 2. ★【今日の一撃】ソートモードが「勢い順」なら、計算した数値が大きい順にソートする
        if (currentSortMode === "momentum") {
            filteredLinks.sort((a, b) => {
                const momentumA = calculateMomentum(a.getAttribute("href"), a.innerText);
                const momentumB = calculateMomentum(b.getAttribute("href"), b.innerText);
                return momentumB - momentumA; // 降順 (大きい順)
            });
        }

        // 3. 確定した並び順で画面にレンダリングする
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

                // ★【バグ修正完了】お気に入りから遷移しても currentBaseUrl が安全に固定されているため100%履歴に残る
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

// ★【今日新しく追加】ボタンの有効・無効を切り替えるユーティリティ関数
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

// ★【今日新しく追加】ソートボタンのクリックイベント
document.getElementById("sort-default-btn").addEventListener("click", () => {
    updateSortButtons("default");
    renderThreadList(document.getElementById("search-input").value);
});

document.getElementById("sort-momentum-btn").addEventListener("click", () => {
    updateSortButtons("momentum");
    renderThreadList(document.getElementById("search-input").value);
});

// 検索イベント
document.getElementById("search-input").addEventListener("input", (e) => {
    const keyword = e.target.value;
    renderThreadList(keyword); 
});

// 戻るボタンのイベント
document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; 
    fetchBbsList(); 
});

// 最初の起動
fetchBbsList();
// script.js

// ★【今日新しく追加】履歴を読み込んで画面に表示する関数
function displayHistory() {
    chrome.storage.local.get(["threadHistory"], (result) => {
        const historyList = document.getElementById("history-list");
        const historySection = document.getElementById("history-section");
        const history = result.threadHistory || [];

        // 履歴が空っぽなら、エリアごと隠す
        if (history.length === 0) {
            historySection.style.display = "none";
            return;
        }

        // 履歴があれば表示する
        historySection.style.display = "block";
        historyList.innerHTML = "";

        history.forEach(item => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = item.url;
            a.innerText = item.title;
            a.target = "_blank"; // クリックで一発ジャンプ！
            
            li.appendChild(a);
            historyList.appendChild(li);
        });
    });
}

// ★【今日新しく追加】スレをクリックした時に、履歴を保存する関数
function saveToHistory(title, url) {
    chrome.storage.local.get(["threadHistory"], (result) => {
        let history = result.threadHistory || [];

        // 1. 重複防止
        history = history.filter(item => item.url !== url);

        // 2. 先頭（一番上）に追加
        history.unshift({ title: title, url: url });

        // 3. ★【ここを修正】上から5件だけを確実に切り取る（6件目以降は自動消滅）
        // 0番目から数えて5件未満（つまり0, 1, 2, 3, 4番目）だけを綺麗に残します
        history = history.slice(0, 5);

        // 4. 保存して、画面の履歴表示を即座に更新する
        chrome.storage.local.set({ threadHistory: history }, () => {
            displayHistory();
        });
    });
}

// 1. 板一覧を取得して画面に表示する
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧 of 取得を依頼します...");
    
    document.getElementById("back-btn").style.display = "none";
    document.querySelector("h3").innerText = "5ch.io 板一覧";
    
    // ★板一覧画面の時は履歴を表示する
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
    const baseUrl = boardUrl.endsWith("/") ? boardUrl : boardUrl + "/";
    const subbackUrl = baseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    document.getElementById("back-btn").style.display = "block";
    // ★スレッド一覧画面に切り替わったら、邪魔なので履歴エリアは一時的に隠す
    document.getElementById("history-section").style.display = "none";

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

                    const urlObj = new URL(baseUrl); 
                    const serverName = urlObj.hostname.split('.')[0]; 
                    const boardName = urlObj.pathname.replace(/\//g, ""); 
                    const threadId = href.split("/")[0]; 

                    const finalUrl = `https://itest.5ch.io/${serverName}/test/read.cgi/${boardName}/${threadId}`;
                    
                    a.href = finalUrl;
                    a.innerText = text;
                    a.target = "_blank"; 

                    // ★【ここが今日の一撃】スレッドのリンクがクリックされたら、履歴に保存する
                    a.addEventListener("click", () => {
                        saveToHistory(text, finalUrl);
                    });

                    li.appendChild(a);
                    listContainer.appendChild(li);
                }
            });

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// 戻るボタンのイベント
document.getElementById("back-btn").addEventListener("click", () => {
    const listContainer = document.getElementById("bbs-list");
    listContainer.innerHTML = "読み込み中..."; 
    fetchBbsList(); 
});

// 最初の起動
fetchBbsList();
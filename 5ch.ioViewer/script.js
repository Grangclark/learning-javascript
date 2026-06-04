// script.js

// 1. 板一覧を取得して画面に表示する（昨日作った関数）
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");

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

                // ★【今日の大事な変更】クリックイベントを乗っ取る
                a.addEventListener("click", (e) => {
                    e.preventDefault(); // 本来のページ移動をキャンセル
                    fetchThreadList(href); // スレッド一覧を取得する関数を呼び出す
                });

                li.appendChild(a);
                listContainer.appendChild(li);
            }
        });
    });
}

// script.js：届いたスレ一覧のHTMLを解析して、画面を書き換える
function fetchThreadList(boardUrl) {
    const baseUrl = boardUrl.endsWith("/") ? boardUrl : boardUrl + "/";
    const subbackUrl = baseUrl + "subback.html";

    console.log(`スレッド一覧を取得します: ${subbackUrl}`);

    chrome.runtime.sendMessage({ action: "fetch_threads", url: subbackUrl }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (response && response.success) {
            console.log("成功！スレッド一覧の解析を開始します...");

            // 1. 届いたHTMLをJavaScriptで扱えるように分解
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");

            // 2. スレ一覧のリンク（<a>タグ）を全部集める
            const links = doc.querySelectorAll("a");

            // 3. 画面の「板一覧」を一旦ぜんぶ綺麗に消す（これで画面遷移っぽくなります）
            listContainer.innerHTML = "";

            // 4. 画面のタイトル（h3）を「スレッド一覧」に変える
            document.querySelector("h3").innerText = "5ch.io スレッド一覧";

            // 5. 集めたスレタイのリンクを画面に並べる
            links.forEach(link => {
                const href = link.getAttribute("href"); // 例: "1712345678/" のような相対パスが入っている
                const text = link.innerText.trim();

                if (href && text) {
                    const li = document.createElement("li");
                    const a = document.createElement("a");

                    // ★5chの仕様：subback内のリンクは相対パスなので、板のベースURLと合体させる
                    // 例: https://egg.5ch.io/game/ + 1712345678/ -> 本物のスレURL
                    // ただし、5chは /test/read.cgi/板名/スレID/ に移動させる必要があるので、まずはそのまま結合するか本家URLにします
                    // 今回はシンプルに、5chが用意したbaseタグのURLを考慮して結合します
                    a.href = baseUrl + href; 
                    a.innerText = text;
                    a.target = "_blank"; // クリックしたらブラウザの新しいタブで開く

                    li.appendChild(a);
                    listContainer.appendChild(li);
                }
            });

        } else {
            listContainer.innerText = "スレッド一覧の取得失敗: " + (response ? response.error : "応答なし");
        }
    });
}

// 実行
fetchBbsList();
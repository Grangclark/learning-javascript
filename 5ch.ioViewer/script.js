// script.js：届いたHTMLから、板名とリンクだけを綺麗に抜き出す
function fetchBbsList() {
    console.log("5ch.io Viewer: backgroundに板一覧の取得を依頼します...");

    chrome.runtime.sendMessage({ action: "fetch_bbs" }, (response) => {
        const listContainer = document.getElementById("bbs-list");

        if (!response) {
            listContainer.innerText = "裏方からの応答がありません。";
            return;
        }

        if (response.success) {
            console.log("成功！データが届きました。解析を開始します...");
            
            // 1. 届いたHTML（文字列）を、JavaScriptで扱える一時的な「仮想画面」に変える
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, "text/html");

            // 2. その中から、すべてのリンク（<A>タグ）だけを全部集める
            const links = doc.querySelectorAll("a");

            // 3. 画面の「読み込み中...」の文字を一旦空っぽにする
            listContainer.innerHTML = "";

            // 4. 集めたリンクの中から、本物の板（httpが含まれるもの）だけを画面に並べる
            links.forEach(link => {
                const href = link.getAttribute("href");
                const text = link.innerText.trim();

                // リンク先と板名がちゃんとある場合だけ、綺麗なリストにする
                if (href && text) {
                    const li = document.createElement("li");
                    const a = document.createElement("a");
                    
                    a.href = href;
                    a.innerText = text;
                    a.target = "_blank"; // クリックしたら新しいタブで開くようにする

                    li.appendChild(a);
                    listContainer.appendChild(li);
                }
            });

        } else {
            listContainer.innerText = "取得失敗: " + response.error;
        }
    });
}

// 実行
fetchBbsList();
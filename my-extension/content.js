// content.js：clearIntervalを消して、常に監視するスタイルに変更
setInterval(() => {
    const secondary = document.getElementById('secondary');
    if (secondary) secondary.remove(); // 見つけるたびに消す！

    const endscreen = document.querySelector('.html5-endscreen');
    if (endscreen) endscreen.remove(); // 出るたびに消す！

    // ★ 今日の4行：より確実に終了画面を消去する
    const videowall = document.querySelector('.ytp-show-videowall-at-endscreen');
    if (videowall) videowall.remove();

    const pauseOverlay = document.querySelector('.ytp-pause-overlay');
    if (pauseOverlay) pauseOverlay.remove();

    // ★ 今日の4行：コメント欄を狙い撃ち
    const comments = document.getElementById('comments');
    if (comments) {
        comments.remove();
    }

    // ★ 今日の4行：トップ画面の動画リストを狙撃
    const primary = document.getElementById('primary');
    if (primary && location.pathname === '/') {
        primary.remove();
    }
}, 500);
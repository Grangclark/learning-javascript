// content.js：要素が現れるまで何度もチェックする
const timer = setInterval(() => {
    const secondary = document.getElementById('secondary');
    if (secondary) {
        secondary.remove();
        clearInterval(timer); // 見つけたら監視を終了する
    }

    // ★ 今日の4行：動画終了時の「おすすめ」も狙い撃ち
    const endscreen = document.querySelector('.html5-endscreen');
    if (endscreen) {
        endscreen.remove();
    }
}, 500); // 0.5秒ごとにチェック
// content.js：要素が現れるまで何度もチェックする
const timer = setInterval(() => {
    const secondary = document.getElementById('secondary');
    if (secondary) {
        secondary.remove();
        clearInterval(timer); // 見つけたら監視を終了する
    }
}, 500); // 0.5秒ごとにチェック
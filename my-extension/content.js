// content.js：clearIntervalを消して、常に監視するスタイルに変更
setInterval(() => {
    const secondary = document.getElementById('secondary');
    if (secondary) secondary.remove(); // 見つけるたびに消す！

    const endscreen = document.querySelector('.html5-endscreen');
    if (endscreen) endscreen.remove(); // 出るたびに消す！
}, 500);
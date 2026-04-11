// content.js：clearIntervalを消して、常に監視するスタイルに変更
setInterval(() => {
    // ★ 今日の4行：Xの「おすすめユーザー」を隠す
    if (location.host === 'x.com') {
        const whoToFollow = document.querySelector('[aria-label="おすすめユーザー"]');
        if (whoToFollow) whoToFollow.style.display = 'none';
    }
}, 500);
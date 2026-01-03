function calculate(operator) {
    const val1 = Number(document.getElementById('num1').value);
    const val2 = Number(document.getElementById('num2').value);
    let result = 0; // 結果は途中で変わるので let を使います

    switch (operator) {
        case 'add':
            result = val1 + val2;
            break;
        case 'sub':
            result = val1 - val2;
            break;
        case 'mul':
            result = val1 * val2;
            break;
        case 'div':
            // 割り算（０で割るエラーチェックも兼ねて）
            result = val2 !== 0 ? val1 / val2 : "エラー（０で割れません）";
            break;
        default:
            result = "不明な操作";
    }

    document.getElementById('result').innerText = "結果は：" + result;
}
function calculate() {
    // 1. 入力欄から値を取得する
    const val1 = document.getElementById('num1').value;
    const val2 = document.getElementById('num2').value;
    
    // 2. 文字列として取得されるので、数値に変換して計算する
    const sum = Number(val1) + Number(val2);

    // 3. 画面の「結果」の部分を書き換える
    document.getElementById('result').innerText = "結果は：" + sum;
}
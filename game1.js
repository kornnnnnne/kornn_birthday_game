let score = 0;
let timeLeft = 10; // 制限時間（30秒）
let gameInterval = null; // ゲームタイマー用
let cornInterval = null; // とうもろこし移動タイマー用
let isPlaying = false;

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const cornElement = document.getElementById('corn');
const gameArea = document.getElementById('game-area');

const GAS_URL = "https://script.google.com/macros/s/AKfycbyyxie90uk3Xtyp427FEkIyTJZRFmM7zR2KYdmvnC7n7nXuzSabLExvFxzrnizfybDB3Q/exec";

// とうもろこしをランダム位置に移動
function moveCorn() {
  if (!isPlaying) return;

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const randomX = Math.floor(Math.random() * (areaWidth - 60));
  const randomY = Math.floor(Math.random() * (areaHeight - 60));

  cornElement.style.left = `${randomX}px`;
  cornElement.style.top = `${randomY}px`;
}

// 自動移動タイマーのリセット（タップされた時や移動時に呼ぶ）
function resetCornTimer() {
  clearInterval(cornInterval);
  moveCorn();
  // 1200ミリ秒（1.2秒）経つと自動的に消えて次の場所へ移動
  cornInterval = setInterval(() => {
    moveCorn();
  }, 1200);
}

// ゲーム開始処理
function startGame() {
  score = 0;
  timeLeft = 10;
  isPlaying = true;

  scoreElement.textContent = score;
  timerElement.textContent = timeLeft;
  
  startBtn.style.display = 'none'; // スタートボタンを隠す
  cornElement.style.display = 'block'; // とうもろこしを表示

  resetCornTimer();

  // カウントダウンタイマー（1秒ごと）
  gameInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ゲーム終了処理
function endGame() {
  isPlaying = false;
  clearInterval(gameInterval);
  clearInterval(cornInterval);

  cornElement.style.display = 'none'; // とうもろこしを非表示
  startBtn.style.display = 'inline-block'; // スタートボタンを再表示
  startBtn.textContent = 'もう一度あそぶ';

  // プレイヤー名を取得
  const playerName = document.getElementById('player-name').value || "ゲスト";

    // スプレッドシートへ送信
  saveScore(playerName, score);

  alert(`ゲーム終了！\nあなたのスコアは ${score} 点でした！`);
}

// スプレッドシートにデータを送信する関数
function saveScore(name, score) {
  fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      action: "saveScore",
      name: name,
      score: score
    })
  })
  .then(() => {
    console.log("スコアを送信しました！");
  })
  .catch((error) => {
    console.error("送信エラー:", error);
  });
}

// とうもろこしをタップしたとき
cornElement.addEventListener('click', () => {
  if (!isPlaying) return;

  score += 10;
  scoreElement.textContent = score;

  // タップされたら即座に次の場所へ移動＆タイマーやり直し
  resetCornTimer();
});

// ★★★ ここを追加しました ★★★
// スタートボタンを押したときに startGame 関数を実行する設定
if (startBtn) {
  startBtn.addEventListener('click', startGame);
}

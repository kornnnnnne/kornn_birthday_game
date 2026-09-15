let score = 0;
let timeLeft = 30; // 制限時間（30秒）
let gameInterval = null; // ゲームタイマー用
let cornInterval = null; // とうもろこし移動タイマー用
let isPlaying = false;

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const cornElement = document.getElementById('corn');
const gameArea = document.getElementById('game-area');

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
  timeLeft = 30;
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

  alert(`ゲーム終了！\nあなたのスコアは ${score} 点でした！`);
}

// とうもろこしをタップしたとき
cornElement.addEventListener('click', () => {
  if (!isPlaying) return;

  score += 10;
  scoreElement.textContent = score;

  // タップされたら即座に次の場所へ移動＆タイマーやり直し
  resetCornTimer();
});

// スタートボタンを押したとき
startBtn.addEventListener('click', startGame);

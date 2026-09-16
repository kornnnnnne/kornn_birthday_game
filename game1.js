// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');

// 未ログインならログイン画面へ送り返す
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'login.html';
}

const GAS_URL = "https://script.google.com/macros/s/AKfycbzsnixc4_NEdPYP78QN5D8m2a5bTsbcV1IWVkVUk-GvaVgbTB3MAnuniS-9PhHatr_u6Q/exec";

// 画面要素の設定
const playerDisplay = document.getElementById('player-display');
const logoutBtn = document.getElementById('logout-btn');

if (playerDisplay) {
  playerDisplay.textContent = loggedInUser;
}

// ログアウト処理
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
}

// --- ゲーム本体の処理 ---

let score = 0;
let timeLeft = 30;
let gameInterval = null;
let cornInterval = null;
let isPlaying = false;

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const cornElement = document.getElementById('corn');
const gameArea = document.getElementById('game-area');

function moveCorn() {
  if (!isPlaying) return;

  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const randomX = Math.floor(Math.random() * (areaWidth - 60));
  const randomY = Math.floor(Math.random() * (areaHeight - 60));

  cornElement.style.left = `${randomX}px`;
  cornElement.style.top = `${randomY}px`;
}

function resetCornTimer() {
  clearInterval(cornInterval);
  moveCorn();
  cornInterval = setInterval(moveCorn, 1200);
}

function startGame() {
  score = 0;
  timeLeft = 30;
  isPlaying = true;

  scoreElement.textContent = score;
  timerElement.textContent = timeLeft;
  
  startBtn.style.display = 'none';
  cornElement.style.display = 'block';

  resetCornTimer();

  gameInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  isPlaying = false;
  clearInterval(gameInterval);
  clearInterval(cornInterval);

  cornElement.style.display = 'none';
  startBtn.style.display = 'inline-block';
  startBtn.textContent = 'もう一度あそぶ';

  // ログイン中の名前でスコア保存
  saveScore(loggedInUser, score);

  alert(`ゲーム終了！\n${loggedInUser} さんのスコアは ${score} 点でした！`);
}

function saveScore(name, score) {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "saveScore",
      name: name,
      score: score
    })
  })
  .then(() => {
    console.log("スコア保存完了");
  });
}

cornElement.addEventListener('click', () => {
  if (!isPlaying) return;

  score += 10;
  scoreElement.textContent = score;
  resetCornTimer();
});

if (startBtn) {
  startBtn.addEventListener('click', startGame);
}

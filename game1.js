// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');

// 未ログインならログイン画面へ送り返す
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'login.html';
}

const GAS_URL = "https://script.google.com/macros/s/AKfycbyKZT7bjd4lBbX1WTcLSuWMMgyPvDnnCmsSY_jv1o6f8k0tx486GadPcwyM4C1IbQfcGQ/exec";

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
let timeLeft = 10;
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

// ゲーム終了処理
function endGame() {
  isPlaying = false;
  clearInterval(gameInterval);
  clearInterval(cornInterval);

  cornElement.style.display = 'none';
  startBtn.style.display = 'inline-block';
  startBtn.textContent = 'もう一度あそぶ';

  // 今回のスコアを画面にセット
  document.getElementById('current-score-display').textContent = score;

  // スコア保存＆ランキング取得を実行
  saveScore(loggedInUser, score);
}

// スコア保存＆結果描画関数
function saveScore(name, score) {
  const resultBoard = document.getElementById('result-board');
  const myHighScoreDisplay = document.getElementById('my-highscore-display');
  const rankingList = document.getElementById('ranking-list');

  // 通信中の表示
  myHighScoreDisplay.textContent = "読み込み中...";
  rankingList.innerHTML = "<li>読み込み中...</li>";
  resultBoard.style.display = 'block';

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "saveScore",
      name: name,
      score: score
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      // 自分のハイスコアを更新
      myHighScoreDisplay.textContent = data.myHighScore;

      // ランキングリストの生成
      rankingList.innerHTML = "";
      data.top5.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} : ${item.score} 点`;
        rankingList.appendChild(li);
      });
    }
  })
  .catch(err => {
    console.error("保存失敗:", err);
    myHighScoreDisplay.textContent = "取得失敗";
    rankingList.innerHTML = "<li>取得失敗</li>";
  });
}

// ゲームスタート時に結果画面を隠す設定を追加
function startGame() {
  score = 0;
  timeLeft = 10;
  isPlaying = true;

  scoreElement.textContent = score;
  timerElement.textContent = timeLeft;
  
  startBtn.style.display = 'none';
  document.getElementById('result-board').style.display = 'none'; // 結果エリアを隠す
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

cornElement.addEventListener('click', () => {
  if (!isPlaying) return;

  score += 10;
  scoreElement.textContent = score;
  resetCornTimer();
});

if (startBtn) {
  startBtn.addEventListener('click', startGame);
}

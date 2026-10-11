// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// 画面上部のプレイヤー表示などがあれば（必要に応じて）
const playerDisplay = document.getElementById('player-display');
if (playerDisplay) {
  playerDisplay.textContent = loggedInUser;
}

// メニューに戻るボタン（上部）
const backMenuBtn = document.getElementById('back-menu-btn');
if (backMenuBtn) {
  backMenuBtn.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 制限時間（秒）
  const GAME_DURATION = 10;

  let score = 0;
  let timeLeft = GAME_DURATION;
  let timerId = null;
  let isPlaying = false;

  // DOM要素の取得
  const timeDisplay = document.getElementById('time-display');
  const scoreDisplay = document.getElementById('score-display');
  const tapBtn = document.getElementById('tap-btn');
  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');
  const resultMessage = document.getElementById('result-message');
  
  // ★ ランキングやハイスコア・コイン表示用の要素
  const myHighScoreDisplay = document.getElementById('my-highscore-display');
  const rankingList = document.getElementById('ranking-list');
  const coinDisplay = document.getElementById('coin-display');

  // ゲームスタート処理
  function startGame() {
    score = 0;
    timeLeft = GAME_DURATION;
    isPlaying = true;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft.toFixed(1);
    resultMessage.textContent = '';

    // 結果表示エリアを隠す（もしあれば）
    const resultBoard = document.getElementById('result-board');
    if (resultBoard) resultBoard.style.display = 'none';

    tapBtn.disabled = false;
    tapBtn.textContent = 'ここを連打！！';
    startBtn.disabled = true;

    // 0.1秒ごとにカウントダウン
    timerId = setInterval(() => {
      timeLeft -= 0.1;

      if (timeLeft <= 0) {
        endGame();
      } else {
        timeDisplay.textContent = timeLeft.toFixed(1);
      }
    }, 100);
  }

  // タップ／クリック時の処理
  function handleTap() {
    if (!isPlaying) return;

    score++;
    scoreDisplay.textContent = score;

    // 押した時のビジュアル演出
    tapBtn.classList.add('active-tap');
    setTimeout(() => tapBtn.classList.remove('active-tap'), 50);
  }

  // ゲーム終了処理
  function endGame() {
    clearInterval(timerId);
    isPlaying = false;

    timeDisplay.textContent = '0.0';
    tapBtn.disabled = true;
    tapBtn.textContent = 'タイムアップ！';
    startBtn.disabled = false;

    // 記録に応じて評価メッセージを変更
    const cps = (score / GAME_DURATION).toFixed(1); // Click Per Second
    let rankMsg = '';

    if (score >= 80) {
      rankMsg = '🏆 神レベル！伝説の連打王！';
    } else if (score >= 60) {
      rankMsg = '🔥 達人レベル！超高速タップ！';
    } else if (score >= 40) {
      rankMsg = '👍 すごい！かなりの連打力！';
    } else {
      rankMsg = '😀 お疲れ様！まだまだ伸び代アリ！';
    }

    resultMessage.textContent = `${rankMsg} (${cps} 回/秒)`;

    // ★ サーバーにスコアを保存してコイン＆ランキングを取得する
    saveScoreAndGetRanking(score);
  }

  // --- スコア保存 & ランキング取得関数 ---
  function saveScoreAndGetRanking(finalScore) {
    const resultBoard = document.getElementById('result-board');
    if (resultBoard) resultBoard.style.display = 'block';

    if (myHighScoreDisplay) myHighScoreDisplay.textContent = "読み込み中...";
    if (rankingList) rankingList.innerHTML = "<li>読み込み中...</li>";

    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: "saveScore",
        name: loggedInUser,
        score: finalScore,
        gameType: "tap_game" // ★ GAS側で連打ゲーム用の報酬計算ができるように指定
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        // ハイスコアの表示更新
        if (myHighScoreDisplay) {
          myHighScoreDisplay.textContent = data.myHighScore;
        }

        // 所持金の表示更新
        if (coinDisplay && data.totalCoins !== undefined) {
          coinDisplay.textContent = data.totalCoins;
        }

        // 獲得コインの通知
        if (data.earnedCoins > 0) {
          alert(`🎉 連打報酬として ${data.earnedCoins} コイン獲得しました！（所持金: ${data.totalCoins} コイン）`);
        }

        // ランキングリストの生成
        if (rankingList) {
          rankingList.innerHTML = "";
          data.top5.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = `${item.name} : ${item.score} 点`;
            rankingList.appendChild(li);
          });
        }
      } else {
        console.error("スコア保存エラー:", data.message);
      }
    })
    .catch(err => {
      console.error("通信エラー:", err);
      if (myHighScoreDisplay) myHighScoreDisplay.textContent = "取得失敗";
      if (rankingList) rankingList.innerHTML = "<li>取得失敗</li>";
    });
  }

  // イベントリスナー設定
  tapBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // ダブルタップズーム抑止
    handleTap();
  });

  startBtn.addEventListener('click', startGame);

  // メニューに戻るボタン
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'menu.html';
    });
  }
});

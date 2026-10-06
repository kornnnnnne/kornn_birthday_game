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

  // ゲームスタート処理
  function startGame() {
    score = 0;
    timeLeft = GAME_DURATION;
    isPlaying = true;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft.toFixed(1);
    resultMessage.textContent = '';

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
    let rank = '';

    if (score >= 80) {
      rank = '🏆 神レベル！伝説の連打王！';
    } else if (score >= 60) {
      rank = '🔥 達人レベル！超高速タップ！';
    } else if (score >= 40) {
      rank = '👍 すごい！かなりの連打力！';
    } else {
      rank = '😀 お疲れ様！まだまだ伸び代アリ！';
    }

    resultMessage.textContent = `${rank} (${cps} 回/秒)`;
  }

  // イベントリスナー設定
  tapBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // ダブルタップズーム抑止
    handleTap();
  });

  startBtn.addEventListener('click', startGame);

  // メニューに戻るボタン
  backBtn.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
});

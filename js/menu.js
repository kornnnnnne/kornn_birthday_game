// 未ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// ==========================================
// ★【追加】ページを開いたときに現在のコインを取得して表示する
// ==========================================
const coinDisplay = document.getElementById('coin-display');
function fetchUserCoins() {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "getCoins",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success" && coinDisplay) {
      coinDisplay.textContent = data.totalCoins;
    }
  })
  .catch(err => {
    console.error("コイン情報の取得に失敗しました:", err);
  });
}

// ページを開いたときに実行！
fetchUserCoins();
// プレイヤー名表示
document.getElementById('player-display').textContent = loggedInUser;

// ボタンイベント設定
document.getElementById('to-game-btn').addEventListener('click', () => {
  window.location.href = 'game1.html';
});

document.getElementById('to-quiz1-btn').addEventListener('click', () => {
  window.location.href = 'quiz1.html';
});

document.getElementById('to-quiz2-btn').addEventListener('click', () => {
  window.location.href = 'quiz2.html';
});

document.getElementById('to-KanjiQuiz-btn').addEventListener('click', () => {
  window.location.href = 'KanjiQuiz.html';
});

document.getElementById('to-Rapid-btn').addEventListener('click', () => {
  window.location.href = 'Rapid.html';
});

document.getElementById('to-slot-btn').addEventListener('click', () => {
  window.location.href = 'slot.html';
});

document.getElementById('to-shop-btn').addEventListener('click', () => {
  window.location.href = 'shop.html';
});

document.getElementById('to-status-btn').addEventListener('click', () => {
  window.location.href = 'status.html';
});

document.getElementById('to-boss-btn').addEventListener('click', () => {
  window.location.href = 'boss.html';
});

// ログアウト処理
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});

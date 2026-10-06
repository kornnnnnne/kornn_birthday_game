// 未ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

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

document.getElementById('to-quiz3-btn').addEventListener('click', () => {
  window.location.href = 'quiz3.html';
});

document.getElementById('to-Rapid-btn').addEventListener('click', () => {
  window.location.href = 'Rapid.html';
});

document.getElementById('to-slot-btn').addEventListener('click', () => {
  window.location.href = 'slot.html';
});

document.getElementById('to-shop-btn').addEventListener('click', () => {
  alert("ショップ機能は現在準備中です！");
  // 将来的に: window.location.href = 'shop.html';
});

// ログアウト処理
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});

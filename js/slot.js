// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// 要素の取得
const coinDisplay = document.getElementById('coin-display');
const spinBtn = document.getElementById('spin-btn');
const backMenuBtn = document.getElementById('back-menu-btn');
const backBtn = document.getElementById('back-btn');
const reel1El = document.getElementById('reel1');
const reel2El = document.getElementById('reel2');
const reel3El = document.getElementById('reel3');
const slotMsgEl = document.getElementById('slot-message');

// メニューに戻るボタンの共通処理
function goToMenu() {
  window.location.href = 'menu.html';
}
if (backMenuBtn) backMenuBtn.addEventListener('click', goToMenu);
if (backBtn) backBtn.addEventListener('click', goToMenu);

// ページ読み込み時に現在のコインを取得して表示する
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

// 初期化時にコインを取得
fetchUserCoins();

// スロットを回す処理
spinBtn.addEventListener('click', () => {
  spinBtn.disabled = true;
  slotMsgEl.textContent = "抽選中...";
  slotMsgEl.style.color = "#fff";
  
  // 回転中のアニメーション風演出
  reel1El.textContent = "🌀";
  reel2El.textContent = "🌀";
  reel3El.textContent = "🌀";

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "spinSlot",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    spinBtn.disabled = false;

    if (data.status === "success") {
      // 実際の出目を反映（左から順番）
      reel1El.textContent = data.reels[0];
      reel2El.textContent = data.reels[1];
      reel3El.textContent = data.reels[2];
      
      if (coinDisplay) {
        coinDisplay.textContent = data.totalCoins;
      }

      // 当たり・ハズレ、およびフィーバー状態に応じたメッセージ表示
      if (data.payout > 0) {
        // 大当たり（セブンやダイヤなど）の場合は特別な色にすることも可能
        if (data.reels[0] === "7️⃣" || data.reels[0] === "💎") {
          slotMsgEl.style.color = "#f1c40f"; // ゴールド（神引き・高額配当）
        } else {
          slotMsgEl.style.color = "#2ecc71"; // 緑色（通常当たり）
        }
        slotMsgEl.innerHTML = `${data.message}<br>🎉 <strong>+${data.payout} コイン獲得！</strong>`;
      } else {
        slotMsgEl.style.color = "#e74c3c"; // 赤色（はずれ）
        slotMsgEl.textContent = data.message;
      }

      // ★ フィーバー中の場合は画面全体の雰囲気を変えるなどの演出を追加できます
      if (data.feverRemaining > 0) {
        slotMsgEl.style.color = "#e67e22"; // オレンジ（フィーバー中）
      }

    } else {
      // コイン不足などのエラー
      alert(data.message);
      slotMsgEl.textContent = data.message;
      slotMsgEl.style.color = "#e74c3c";
      fetchUserCoins();
    }
  })
  .catch(err => {
    spinBtn.disabled = false;
    console.error("通信エラー:", err);
    alert("通信に失敗しました");
    slotMsgEl.textContent = "通信エラーが発生しました";
    slotMsgEl.style.color = "#e74c3c";
  });
});

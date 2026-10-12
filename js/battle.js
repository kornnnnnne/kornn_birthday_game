// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// 要素の取得
const coinDisplay = document.getElementById('coin-display');
const battleMsgEl = document.getElementById('battle-message');
const battleBtns = document.querySelectorAll('.battle-btn');
const backMenuBtn = document.getElementById('back-menu-btn');
const backBtn = document.getElementById('back-btn');

// メニューに戻る共通処理
function goToMenu() {
  window.location.href = 'menu.html';
}
backMenuBtn.addEventListener('click', goToMenu);
backBtn.addEventListener('click', goToMenu);

// ★ モンスターデータ（フロント側で管理：各難易度3体ずつ）
const monsterDatabase = {
  easy: [
    { name: "スライム", power: 5, rewardCoins: 10, rewardExp: 15 },
    { name: "おばけキノコ", power: 8, rewardCoins: 15, rewardExp: 20 },
    { name: "コウモリ", power: 12, rewardCoins: 20, rewardExp: 25 }
  ],
  normal: [
    { name: "ゴブリン", power: 25, rewardCoins: 35, rewardExp: 40 },
    { name: "オーク", power: 35, rewardCoins: 50, rewardExp: 55 },
    { name: "スケルトン", power: 45, rewardCoins: 65, rewardExp: 70 }
  ],
  hard: [
    { name: "ドラゴン", power: 70, rewardCoins: 100, rewardExp: 100 },
    { name: "ゴーレム", power: 85, rewardCoins: 130, rewardExp: 130 },
    { name: "ダークナイト", power: 100, rewardCoins: 160, rewardExp: 160 }
  ]
};

// プレイヤーのステータス保持用
let playerStatus = { attack: 20 };

// ページ読み込み時にステータス（攻撃力など）とコインを取得
function fetchPlayerStatus() {
  // 所持コインの取得
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: "getCoins", name: loggedInUser })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success" && coinDisplay) {
      coinDisplay.textContent = data.totalCoins;
    }
  });

  // プレイヤーステータス（攻撃力）の取得
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: "getStatus", name: loggedInUser })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success" && data.statusData) {
      playerStatus.attack = Number(data.statusData.attack) || 20;
    }
  })
  .catch(err => console.error("ステータス取得エラー:", err));
}

fetchPlayerStatus();

// 難易度ボタンが押されたときの処理
battleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const difficulty = btn.getAttribute('data-diff');
    const list = monsterDatabase[difficulty];
    if (!list) return;

    // 1. ランダムでモンスターを1体選出
    const enemy = list[Math.floor(Math.random() * list.length)];

    // 2. 勝敗判定（プレイヤーステータス vs モンスターの強さ）
    const isWin = playerStatus.attack >= enemy.power;
    const earnedCoins = isWin ? enemy.rewardCoins : 0;
    const earnedExp = isWin ? enemy.rewardExp : 5; // 負けても少し経験値が入るなど

    // 3. 画面演出（ボタン無効化 & 探索中メッセージ）
    battleBtns.forEach(b => b.disabled = true);
    battleMsgEl.style.color = "#fff";
    battleMsgEl.textContent = `🔍 探索中... ${enemy.name} が現れた！`;

    // 4. 少しタメを作ってからGAS（サーバー）へコイン更新をリクエスト
    setTimeout(() => {
      // 勝利時のみコインを加算（updateCoinsを使用）
      const requestAction = earnedCoins > 0 ? "updateCoins" : "getCoins";
      const requestBody = earnedCoins > 0 
        ? { action: "updateCoins", name: loggedInUser, amount: earnedCoins }
        : { action: "getCoins", name: loggedInUser };

      fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(requestBody)
      })
      .then(res => res.json())
      .then(data => {
        battleBtns.forEach(b => b.disabled = false);

        if (data.status === "success") {
          if (coinDisplay) {
            coinDisplay.textContent = data.totalCoins;
          }

          if (isWin) {
            battleMsgEl.style.color = "#2ecc71";
            battleMsgEl.innerHTML = `🎉 <strong>${enemy.name}</strong> を討伐成功！<br>+${earnedCoins} コイン / +${earnedExp} EXP獲得！`;
          } else {
            battleMsgEl.style.color = "#e74c3c";
            battleMsgEl.innerHTML = `💥 <strong>${enemy.name}</strong> に返り討ちに遭った…<br>もっと装備を鍛えよう！`;
          }
        } else {
          alert(data.message);
          battleBtns.forEach(b => b.disabled = false);
        }
      })
      .catch(err => {
        battleBtns.forEach(b => b.disabled = false);
        console.error("通信エラー:", err);
        alert("通信に失敗しました");
      });
    }, 1000);
  });
});

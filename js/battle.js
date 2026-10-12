// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// メニューに戻るボタン
document.getElementById('back-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

document.getElementById('player-name').textContent = loggedInUser;

// モンスターデータベース（各難易度3体ずつ）
const monsterDatabase = {
  easy: [
    { name: "スライム", hp: 40, maxHp: 40, attack: 12, defense: 4, rewardCoins: 15, rewardExp: 20 },
    { name: "おばけキノコ", hp: 50, maxHp: 50, attack: 15, defense: 5, rewardCoins: 20, rewardExp: 25 },
    { name: "コウモリ", hp: 35, maxHp: 35, attack: 18, defense: 3, rewardCoins: 25, rewardExp: 30 }
  ],
  normal: [
    { name: "ゴブリン", hp: 80, maxHp: 80, attack: 25, defense: 8, rewardCoins: 40, rewardExp: 50 },
    { name: "オーク", hp: 100, maxHp: 100, attack: 30, defense: 10, rewardCoins: 55, rewardExp: 65 },
    { name: "スケルトン", hp: 90, maxHp: 90, attack: 35, defense: 7, rewardCoins: 70, rewardExp: 80 }
  ],
  hard: [
    { name: "ドラゴン", hp: 150, maxHp: 150, attack: 45, defense: 15, rewardCoins: 100, rewardExp: 120 },
    { name: "ゴーレム", hp: 180, maxHp: 180, attack: 40, defense: 20, rewardCoins: 130, rewardExp: 150 },
    { name: "ダークナイト", hp: 160, maxHp: 160, attack: 50, defense: 12, rewardCoins: 160, rewardExp: 180 }
  ]
};

// プレイヤーのステータス & インベントリ保持用
let playerStatus = {
  maxHp: 100,
  hp: 100,
  attack: 20,
  defense: 10,
  potions: 0 // ポーションの所持数
};

// 現在出現している敵のオブジェクト
let currentEnemy = null;
let earnedCoins = 0;

// ログ出力用関数
function addLog(message) {
  const logBox = document.getElementById('log-box');
  logBox.innerHTML += `<br>${message}`;
  logBox.scrollTop = logBox.scrollHeight;
}

// 画面のHPゲージや数値を更新する関数
function updateDisplay() {
  if (!currentEnemy) return;

  // 敵
  document.getElementById('enemy-current-hp').textContent = Math.max(0, currentEnemy.hp);
  document.getElementById('enemy-max-hp').textContent = currentEnemy.maxHp;
  const enemyHpPercent = (currentEnemy.hp / currentEnemy.maxHp) * 100;
  document.getElementById('enemy-hp-gauge').style.width = `${Math.max(0, enemyHpPercent)}%`;

  // プレイヤー
  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;

  // ポーション数
  document.getElementById('potion-count').textContent = playerStatus.potions;
}

// サーバからステータスとインベントリ（ポーション所持数など）を取得
function fetchPlayerData() {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "getStatusAndInventory",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      const s = data.statusData;
      playerStatus.maxHp = Number(s.hp) || 100;
      playerStatus.hp = Number(s.hp) || 100;
      playerStatus.attack = Number(s.attack) || 20;
      playerStatus.defense = Number(s.defense) || 10;

      // インベントリからポーションの数を解析 (例: "ポーション:2" の形式)
      const potionsStr = data.inventoryData.potions || "";
      playerStatus.potions = parsePotionCount(potionsStr);

      // コイン情報も右上用に取得
      fetchCoins();
    } else {
      alert(data.message);
      window.location.href = 'menu.html';
    }
  })
  .catch(err => {
    console.error("データ取得エラー:", err);
    alert("データの読み込みに失敗しました");
  });
}

// ポーションの文字列から個数を抽出すするヘルパー関数
function parsePotionCount(potionsStr) {
  if (!potionsStr) return 0;
  const parts = potionsStr.split(",");
  for (let p of parts) {
    if (p.startsWith("ポーション:")) {
      return parseInt(p.split(":")[1]) || 0;
    }
  }
  return 0;
}

function fetchCoins() {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: "getCoins", name: loggedInUser })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      document.getElementById('coin-display').textContent = data.totalCoins;
    }
  });
}

// 初期化：ページ読み込み時にプレイヤーデータを取得
fetchPlayerData();

// 難易度ボタンが押されたときの処理（バトル画面に切り替え）
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const diff = btn.getAttribute('data-diff');
    const list = monsterDatabase[diff];
    if (!list) return;

    // 3体の中からランダムで1体選出
    const template = list[Math.floor(Math.random() * list.length)];
    // オブジェクトを複製して現在の敵に設定
    currentEnemy = { ...template };
    earnedCoins = template.rewardCoins;

    // 画面切り替え
    document.getElementById('difficulty-select-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    document.getElementById('enemy-title').textContent = `⚔️ ${currentEnemy.name} が現れた！`;
    document.getElementById('enemy-name-display').textContent = currentEnemy.name;

    updateDisplay();
    addLog(`🔍 探索中... ${currentEnemy.name} と遭遇した！バトル開始！`);
  });
});

// プレイヤーの攻撃ターン
function playerAttack() {
  setButtonsEnabled(false);

  let damage = Math.max(1, playerStatus.attack - Math.floor(currentEnemy.defense / 2));
  damage += Math.floor(Math.random() * 5) - 2;
  damage = Math.max(1, damage);

  currentEnemy.hp -= damage;
  updateDisplay();
  addLog(`あなたの攻撃！ ${currentEnemy.name} に ${damage} のダメージを与えた！`);

  if (currentEnemy.hp <= 0) {
    addLog(`🎉 ${currentEnemy.name} を討伐成功！ +${earnedCoins} コイン獲得！`);
    endBattle(true);
    return;
  }

  setTimeout(bossTurn, 1000);
}

// ポーションを使う処理
function usePotion() {
  if (playerStatus.potions <= 0) {
    alert("ポーションを持っていません！ショップで購入しよう。");
    return;
  }

  if (playerStatus.hp >= playerStatus.maxHp) {
    alert("HPはすでに満タンです！");
    return;
  }

  setButtonsEnabled(false);

  // ポーション消費と回復（回復量例: 50回復）
  playerStatus.potions--;
  const healAmount = 50;
  playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
  updateDisplay();

  addLog(`🧪 ポーションを使用した！ HPが ${healAmount} 回復した！`);

  // ポーション使用時も敵の反撃ターンへ
  setTimeout(bossTurn, 1000);
}

// 敵の反撃ターン
function bossTurn() {
  let damage = Math.max(1, currentEnemy.attack - Math.floor(playerStatus.defense / 2));
  damage += Math.floor(Math.random() * 4) - 2;
  damage = Math.max(1, damage);

  playerStatus.hp -= damage;
  updateDisplay();
  addLog(`⚠️ ${currentEnemy.name} の攻撃！ あなたは ${damage} のダメージを受けた！`);

  if (playerStatus.hp <= 0) {
    addLog(`💀 体力尽きた… 敗北…。`);
    endBattle(false);
    return;
  }

  setButtonsEnabled(true);
}

// ボタンの有効/無効切り替え
function setButtonsEnabled(enabled) {
  document.getElementById('attack-btn').disabled = !enabled;
  document.getElementById('potion-btn').disabled = !enabled;
  document.getElementById('escape-btn').disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('to-menu-btn').style.display = 'block';

  if (isWin) {
    // 勝利時はGASにお金を加算するリクエストを送る
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: "addExpAndCoins",
        name: loggedInUser,
        amount: earnedCoins,
        earnedExp: earnedExp
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        document.getElementById('coin-display').textContent = data.totalCoins;
        addLog(`💰 所持金が ${earnedCoins} コイン増えました！（残高: ${data.totalCoins} コイン）`);
        addLog(`✨ +${earnedExp} 経験値を獲得した！`);
      }
      if (data.leveledUp) {
        addLog(`🎉 <strong>レベルが ${data.newLevel} に上がった！！ステータスがアップした！</strong>`);
      }
    });
  } else {
    addLog("修行を積んで、また挑み直そう！");
  }
}

// 逃げる処理
function escapeBattle() {
  if (confirm("本当に逃げますか？")) {
    window.location.href = 'menu.html';
  }
}

// イベントリスナー登録
document.getElementById('attack-btn').addEventListener('click', playerAttack);
document.getElementById('potion-btn').addEventListener('click', usePotion);
document.getElementById('escape-btn').addEventListener('click', escapeBattle);
document.getElementById('to-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

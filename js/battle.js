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

// アイテムのステータス上昇値マスター
const ITEM_EFFECTS = {
  "銅の剣": { type: "attack", value: 10 },
  "鉄の剣": { type: "attack", value: 25 },
  "コーンの剣": { type: "attack", value: 100 },
  "伝説の剣": { type: "attack", value: 1000 },
  "布の服": { type: "defense", value: 5 },
  "鉄の鎧": { type: "defense", value: 20 },
  "コーンの鎧": { type: "defense", value: 100 },
  "伝説の鎧": { type: "defense", value: 500 }
};

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
  inventoryPotions: {}
};

// 現在出現している敵のオブジェクトと報酬
let currentEnemy = null;
let earnedCoins = 0;
let earnedExp = 0;

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
}

// サーバからステータスとインベントリ（装備やポーション等）を取得
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
      const inv = data.inventoryData;

      let baseAttack = Number(s.attack) || 20;
      let baseDefense = Number(s.defense) || 10;
      let baseHp = Number(s.hp) || 100;

      // 装備ボーナス加算
      if (inv.equippedWeapon && inv.equippedWeapon !== "なし") {
        const effect = ITEM_EFFECTS[inv.equippedWeapon];
        if (effect && effect.type === "attack") baseAttack += effect.value;
      }
      if (inv.equippedArmor && inv.equippedArmor !== "なし") {
        const effect = ITEM_EFFECTS[inv.equippedArmor];
        if (effect && effect.type === "defense") baseDefense += effect.value;
      }

      playerStatus.maxHp = baseHp;
      playerStatus.hp = baseHp;
      playerStatus.attack = baseAttack;
      playerStatus.defense = baseDefense;

      // 所持アイテムをパース（ストーリー系は除外）
      playerStatus.inventoryPotions = parsePotionInventory(inv.potions);

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

// ポーション文字列をパースするヘルパー
function parsePotionInventory(potionsStr) {
  let result = {};
  if (!potionsStr) return result;
  potionsStr.split(",").forEach(p => {
    const parts = p.split(":");
    if (parts.length === 2) {
      const name = parts[0].trim();
      const count = parseInt(parts[1]) || 0;
      if (count > 0 && !name.includes("ストーリー")) {
        result[name] = count;
      }
    }
  });
  return result;
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

// 初期化実行
fetchPlayerData();

// 難易度ボタンが押されたときの処理（バトル画面に切り替え）
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const diff = btn.getAttribute('data-diff');
    const list = monsterDatabase[diff];
    if (!list) return;

    const template = list[Math.floor(Math.random() * list.length)];
    currentEnemy = { ...template };
    earnedCoins = template.rewardCoins;
    earnedExp = template.rewardExp; // 経験値も正しく保持

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
    addLog(`🎉 ${currentEnemy.name} を討伐成功！`);
    endBattle(true);
    return;
  }

  setTimeout(enemyTurn, 1000);
}

// アイテム選択画面を開く
function showItemSelect() {
  const itemNames = Object.keys(playerStatus.inventoryPotions);
  const availableItems = itemNames.filter(name => playerStatus.inventoryPotions[name] > 0);

  const container = document.getElementById('item-buttons-container');
  container.innerHTML = "";

  if (availableItems.length === 0) {
    container.innerHTML = `<p style="font-size: 14px; color: #aaa; margin: 10px 0;">使えるアイテムがありません</p>`;
  } else {
    availableItems.forEach(itemName => {
      const count = playerStatus.inventoryPotions[itemName];
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn';
      btn.style.backgroundColor = '#27ae60';
      btn.textContent = `${itemName} (${count})`;
      btn.addEventListener('click', () => {
        useItem(itemName);
      });
      container.appendChild(btn);
    });
  }

  document.getElementById('command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'block';
}

// アイテム選択画面からメインコマンドに戻る
function hideItemSelect() {
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('command-box').style.display = 'flex';
}

// 個別アイテム使用処理
function useItem(itemName) {
  if (playerStatus.inventoryPotions[itemName] <= 0) {
    alert("アイテムが足りません！");
    return;
  }

  if (playerStatus.hp >= playerStatus.maxHp) {
    alert("HPはすでに満タンです！");
    return;
  }

  playerStatus.inventoryPotions[itemName]--;

  let healAmount = 50;
  if (itemName.includes("中級")) healAmount = 100;
  if (itemName.includes("上級")) healAmount = 200;

  playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
  updateDisplay();

  addLog(`🧪 ${itemName} を使った！ HPが ${healAmount} 回復した！`);

  hideItemSelect();
  setButtonsEnabled(false);
  setTimeout(enemyTurn, 1000);
}

// 敵の反撃ターン
function enemyTurn() {
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
  const attackBtn = document.getElementById('attack-btn');
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');
  const escapeBtn = document.getElementById('escape-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (itemToggleBtn) itemToggleBtn.disabled = !enabled;
  if (escapeBtn) escapeBtn.disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('to-menu-btn').style.display = 'block';

  if (isWin) {
    // 勝利時はGASにコインと経験値を同時に加算するリクエストを送る
    fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: "addExpAndCoins",
        name: loggedInUser,
        earnedCoins: earnedCoins,
        earnedExp: earnedExp
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        document.getElementById('coin-display').textContent = data.totalCoins;
        addLog(`💰 +${earnedCoins} コイン獲得！（残高: ${data.totalCoins} コイン）`);
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
document.getElementById('item-select-toggle-btn').addEventListener('click', showItemSelect);
document.getElementById('back-to-main-btn').addEventListener('click', hideItemSelect);
document.getElementById('escape-btn').addEventListener('click', escapeBattle);
document.getElementById('to-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

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

// プレイヤーのステータス保持用
let playerStatus = {
  maxHp: 100,
  hp: 100,
  maxMp: 50,
  mp: 50,
  attack: 20,
  magicAttack: 15,
  defense: 10,
  magicDefense: 10,
  inventoryPotions: {} // 例: { "初級ポーション": 2, "コーン茶": 1 }
};

// ボスのステータス（固定）
const boss = {
  name: "コーン魔王",
  maxHp: 7000,
  hp: 7000,
  attack: 1000,
  defense: 500
};

// ログ出力用関数
function addLog(message) {
  const logBox = document.getElementById('log-box');
  logBox.innerHTML += `<br>${message}`;
  logBox.scrollTop = logBox.scrollHeight;
}

// 画面のHP/MPゲージや数値を更新する関数
function updateDisplay() {
  // ボス
  document.getElementById('boss-current-hp').textContent = Math.max(0, boss.hp);
  document.getElementById('boss-max-hp').textContent = boss.maxHp;
  const bossHpPercent = (boss.hp / boss.maxHp) * 100;
  document.getElementById('boss-hp-gauge').style.width = `${Math.max(0, bossHpPercent)}%`;

  // プレイヤー HP
  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;

  // プレイヤー MP
  document.getElementById('player-current-mp').textContent = Math.max(0, playerStatus.mp);
  document.getElementById('player-max-mp').textContent = playerStatus.maxMp;
  const playerMpPercent = (playerStatus.mp / playerStatus.maxMp) * 100;
  document.getElementById('player-mp-gauge').style.width = `${Math.max(0, playerMpPercent)}%`;
}

// サーバからステータスとインベントリを取得
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
      let baseMagicAttack = Number(s.magicAttack) || 15;
      let baseDefense = Number(s.defense) || 10;
      let baseHp = Number(s.hp) || 100;
      let baseMp = Number(s.mp) || 50;

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
      playerStatus.maxMp = baseMp;
      playerStatus.mp = baseMp;
      playerStatus.attack = baseAttack;
      playerStatus.magicAttack = baseMagicAttack;
      playerStatus.defense = baseDefense;

      // ポーション類をオブジェクト形式でパース ("初級ポーション:2,コーン茶:1" など)
      playerStatus.inventoryPotions = parsePotionInventory(inv.potions);

      updateDisplay();
      addLog("ステータスと装備を読み込みました。バトル開始！");
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
      if (count > 0) result[name] = count;
    }
  });
  return result;
}

fetchPlayerData();

// プレイヤーの攻撃ターン
function playerAttack() {
  setButtonsEnabled(false);

  let damage = Math.max(1, playerStatus.attack - Math.floor(boss.defense / 2));
  damage += Math.floor(Math.random() * 5) - 2;
  damage = Math.max(1, damage);

  boss.hp -= damage;
  updateDisplay();
  addLog(`あなたの攻撃！ ${boss.name} に ${damage} のダメージを与えた！`);

  if (boss.hp <= 0) {
    addLog(`🎉 ${boss.name} を討伐した！ 勝利！`);
    endBattle(true);
    return;
  }

  setTimeout(bossTurn, 1200);
}

// アイテム選択・使用処理
function useItem() {
  const itemNames = Object.keys(playerStatus.inventoryPotions);
  const availableItems = itemNames.filter(name => playerStatus.inventoryPotions[name] > 0);

  if (availableItems.length === 0) {
    alert("使えるアイテムを持っていません！ショップで購入しよう。");
    return;
  }

  // 選択肢用の文字列を作る
  let message = "使うアイテムを選んでください:\n";
  availableItems.forEach((name, index) => {
    message += `${index + 1}: ${name} (残り: ${playerStatus.inventoryPotions[name]}個)\n`;
  });

  const choiceStr = prompt(message);
  if (!choiceStr) return; // キャンセルされた場合

  const choiceIndex = parseInt(choiceStr) - 1;
  if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= availableItems.length) {
    alert("無効な選択です。");
    return;
  }

  const selectedItem = availableItems[choiceIndex];

  // アイテム消費
  playerStatus.inventoryPotions[selectedItem]--;

  // サーバー上のインベントリも減らす処理が必要な場合はここでGASにリクエストを送信可能
  // 効果の適用（例としてHP回復など）
  let healAmount = 500;
  if (selectedItem.includes("中級")) healAmount = 1000;
  if (selectedItem.includes("上級")) healAmount = 2500;

  playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
  updateDisplay();

  addLog(`🧪 ${selectedItem} を使った！ HPが ${healAmount} 回復した！`);

  setButtonsEnabled(false);
  setTimeout(bossTurn, 1200);
}

// ボスの反撃ターン
function bossTurn() {
  const randomVal = Math.floor(Math.random() * 10);

  if (randomVal < 6) {
    let damage = Math.max(1, boss.attack - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 4) - 2;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`⚠️ ${boss.name} の攻撃！ あなたは ${damage} のダメージを受けた！`);

  } else if (randomVal < 9) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.2) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} のクリムゾンフレア！ ${damage} のダメージを受けた！`);

  } else {
    let heal = 1000;
    boss.hp = Math.min(boss.maxHp, boss.hp + heal);
    updateDisplay();
    addLog(`✨ ${boss.name} はこーんをたべて、HPを ${heal} 回復した！`);
  }

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
  const itemBtn = document.getElementById('item-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (itemBtn) itemBtn.disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  const cmdBox = document.getElementById('command-box');
  const menuBtn = document.getElementById('to-menu-btn');
  if (cmdBox) cmdBox.style.display = 'none';
  if (menuBtn) menuBtn.style.display = 'block';

  if (isWin) {
    addLog("見事な勝利だ！ メニューに戻って次の冒険に備えよう。");
  } else {
    addLog("修行を積んで、また挑み直そう！");
  }
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attack-btn');
  const itemBtn = document.getElementById('item-btn');

  if (attackBtn) attackBtn.addEventListener('click', playerAttack);
  if (itemBtn) itemBtn.addEventListener('click', useItem);
});

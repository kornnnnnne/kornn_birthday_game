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
  inventoryPotions: {}
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
  document.getElementById('boss-current-hp').textContent = Math.max(0, boss.hp);
  document.getElementById('boss-max-hp').textContent = boss.maxHp;
  const bossHpPercent = (boss.hp / boss.maxHp) * 100;
  document.getElementById('boss-hp-gauge').style.width = `${Math.max(0, bossHpPercent)}%`;

  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;

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

// ポーション文字列をパースするヘルパー（ストーリーアイテムなどの非戦闘用を除外することも可能）
function parsePotionInventory(potionsStr) {
  let result = {};
  if (!potionsStr) return result;
  potionsStr.split(",").forEach(p => {
    const parts = p.split(":");
    if (parts.length === 2) {
      const name = parts[0].trim();
      const count = parseInt(parts[1]) || 0;
      // ストーリー系アイテムを除外して戦闘用アイテムだけにする場合
      if (count > 0 && !name.includes("ストーリー")) {
        result[name] = count;
      }
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
      btn.className = 'dynamic-item-btn';
      btn.textContent = `${itemName} (${count})`;
      btn.addEventListener('click', () => {
        useItem(itemName);
      });
      container.appendChild(btn);
    });
  }

  // メインコマンドを隠してアイテム選択画面を表示
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'block';
}

// アイテム選択画面からメインコマンドに戻る
function hideItemSelect() {
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('command-box').style.display = 'block';
}

// 個別のアイテムを使用する処理
function useItem(itemName) {
  if (playerStatus.inventoryPotions[itemName] <= 0) {
    alert("アイテムが足りません！");
    return;
  }

  // 所持数を減らす
  playerStatus.inventoryPotions[itemName]--;

  // 効果の適用
  let healAmount = 500;
  if (itemName.includes("中級")) healAmount = 1000;
  if (itemName.includes("上級")) healAmount = 2500;

  playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
  updateDisplay();

  addLog(`🧪 ${itemName} を使った！ HPが ${healAmount} 回復した！`);

  // アイテム選択画面を隠す
  hideItemSelect();
  setButtonsEnabled(false);

  // ボスのターンへ
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
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (itemToggleBtn) itemToggleBtn.disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'none';
  const menuBtn = document.getElementById('to-menu-btn');
  if (menuBtn) menuBtn.style.display = 'block';

  if (isWin) {
    addLog("見事な勝利だ！ メニューに戻って次の冒険に備えよう。");
  } else {
    addLog("修行を積んで、また挑み直そう！");
  }
}

// イベントリスナーの割り当て
document.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attack-btn');
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');
  const backToMainBtn = document.getElementById('back-to-main-btn');

  if (attackBtn) attackBtn.addEventListener('click', playerAttack);
  if (itemToggleBtn) itemToggleBtn.addEventListener('click', showItemSelect);
  if (backToMainBtn) backToMainBtn.addEventListener('click', hideItemSelect);
});

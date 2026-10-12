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

// プレイヤーのステータス保持用（基礎値 ＋ 装備ボーナス）
let playerStatus = {
  maxHp: 100,
  hp: 100,
  attack: 20,
  magicAttack: 15,
  defense: 10,
  magicDefense: 10,
  potions: 0
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

// 画面のHPゲージや数値を更新する関数
function updateDisplay() {
  // ボス
  document.getElementById('boss-current-hp').textContent = Math.max(0, boss.hp);
  document.getElementById('boss-max-hp').textContent = boss.maxHp;
  const bossHpPercent = (boss.hp / boss.maxHp) * 100;
  document.getElementById('boss-hp-gauge').style.width = `${Math.max(0, bossHpPercent)}%`;

  // プレイヤー
  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;

  // ポーション数表示があれば更新
  const potionEl = document.getElementById('potion-count');
  if (potionEl) potionEl.textContent = playerStatus.potions;
}

// ★ サーバからステータスとインベントリ（装備・アイテム）を同時に取得
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

      // 基礎ステータスのセット（魔法攻撃力も追加）
      let baseAttack = Number(s.attack) || 20;
      let baseMagicAttack = Number(s.magicAttack) || 15;
      let baseDefense = Number(s.defense) || 10;
      let baseHp = Number(s.hp) || 100;

      // ★ 装備によるボーナス計算を加算
      if (inv.equippedWeapon && inv.equippedWeapon !== "なし") {
        const effect = ITEM_EFFECTS[inv.equippedWeapon];
        if (effect && effect.type === "attack") {
          baseAttack += effect.value;
        }
      }
      if (inv.equippedArmor && inv.equippedArmor !== "なし") {
        const effect = ITEM_EFFECTS[inv.equippedArmor];
        if (effect && effect.type === "defense") {
          baseDefense += effect.value;
        }
      }

      playerStatus.maxHp = baseHp;
      playerStatus.hp = baseHp;
      playerStatus.attack = baseAttack;
      playerStatus.magicAttack = baseMagicAttack;
      playerStatus.defense = baseDefense;

      // ★ ポーションの所持数を抽出（例: "初級ポーション:2,ポーション:3" などに対応）
      playerStatus.potions = parsePotionCount(inv.potions);

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

// ポーションの個数を文字列からパースするヘルパー
function parsePotionCount(potionsStr) {
  if (!potionsStr) return 0;
  let total = 0;
  potionsStr.split(",").forEach(p => {
    const parts = p.split(":");
    // 「初級ポーション」や通常の「ポーション」を合計、または特定のポーション数をカウント
    if (parts.length === 2) {
      total += parseInt(parts[1]) || 0;
    }
  });
  return total;
}

// ページ読み込み時に実行
fetchPlayerData();

// プレイヤーの攻撃ターン
function playerAttack() {
  setButtonsEnabled(false);

  // ダメージ計算（攻撃力 - ボスの防御力 / 2）
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

// ★ ポーション使用処理
function usePotion() {
  if (playerStatus.potions <= 0) {
    alert("ポーションを持っていません！");
    return;
  }
  if (playerStatus.hp >= playerStatus.maxHp) {
    alert("HPはすでに満タンです！");
    return;
  }

  setButtonsEnabled(false);

  // 所持数を減らす
  playerStatus.potions--;
  const healAmount = 500; // 回復量
  playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
  updateDisplay();

  addLog(`🧪 ポーションを使用した！ HPが ${healAmount} 回復した！（残りポーション: ${playerStatus.potions}個）`);

  // ポーション使用時もボスのターンへ
  setTimeout(bossTurn, 1200);
}

// ボスの反撃ターン
function bossTurn() {
  const randomVal = Math.floor(Math.random() * 10);

  if (randomVal < 6) {
    // 【確率 60%】通常攻撃
    let damage = Math.max(1, boss.attack - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 4) - 2;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`⚠️ ${boss.name} の攻撃！ あなたは ${damage} のダメージを受けた！`);

  } else if (randomVal < 9) {
    // 【確率 30%】必殺技
    let damage = Math.max(1, Math.floor(boss.attack * 1.2) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} のクリムゾンフレア！ ${damage} のダメージを受けた！`);

  } else {
    // 【確率 10%】回復
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
  const potionBtn = document.getElementById('potion-btn');
  const escapeBtn = document.getElementById('escape-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (potionBtn) potionBtn.disabled = !enabled;
  if (escapeBtn) escapeBtn.disabled = !enabled;
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

// 逃げる処理
function escapeBattle() {
  if (confirm("本当に逃げますか？")) {
    window.location.href = 'menu.html';
  }
}

// イベントリスナーの割り当て（HTML側にボタンがある場合）
document.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attack-btn');
  const potionBtn = document.getElementById('potion-btn');
  const escapeBtn = document.getElementById('escape-btn');
  const toMenuBtn = document.getElementById('to-menu-btn');

  if (attackBtn) attackBtn.addEventListener('click', playerAttack);
  if (potionBtn) potionBtn.addEventListener('click', usePotion);
  if (escapeBtn) escapeBtn.addEventListener('click', escapeBattle);
  if (toMenuBtn) toMenuBtn.addEventListener('click', () => { window.location.href = 'menu.html'; });
});

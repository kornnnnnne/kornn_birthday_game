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

// スキルマスター（レベル別・全14種）
const SKILL_DATABASE = [
  { id: "skill_1", name: "全力斬り", type: "attack", requiredLevel: 1, mpCost: 10, multiplier: 1.5, desc: "通常より少し強い物理攻撃 (消費MP10)" },
  { id: "skill_2", name: "ヒール", type: "heal", requiredLevel: 3, mpCost: 15, healValue: 300, desc: "HPを少量回復 (消費MP15)" },
  { id: "skill_3", name: "フレイム", type: "magic", requiredLevel: 5, mpCost: 20, multiplier: 3.0, desc: "火の魔法攻撃 (消費MP20)" },
  { id: "skill_4", name: "サンダー", type: "magic", requiredLevel: 8, mpCost: 25, multiplier: 3.4, desc: "雷の魔法攻撃 (消費MP25)" },
  { id: "skill_5", name: "ブリザード", type: "magic", requiredLevel: 10, mpCost: 30, multiplier: 3.6, desc: "氷の魔法攻撃 (消費MP30)" },
  { id: "skill_6", name: "黒・魔・導", type: "magic", requiredLevel: 15, mpCost: 50, multiplier: 4.0, desc: "ブラック・マジック！！ (消費MP50)" },
  { id: "skill_7", name: "ハイヒール", type: "heal", requiredLevel: 16, mpCost: 50, healValue: 1000, desc: "HPを中量回復 (消費MP50)" },
  { id: "skill_8", name: "滅びの爆裂疾風弾", type: "magic", requiredLevel: 20, mpCost: 70, multiplier: 5.0, desc: "滅びのバーストストリーム！！ (消費MP70)" },
  { id: "skill_9", name: "メテオバースト", type: "magic", requiredLevel: 23, mpCost: 80, multiplier: 5.2, desc: "メテオバースト！ (消費MP80)" },
  { id: "skill_10", name: "ダークフレア", type: "magic", requiredLevel: 25, mpCost: 100, multiplier: 5.5, desc: "漆黒の炎に抱かれて消えろ！ (消費MP100)" },
  { id: "skill_11", name: "神の祈り", type: "heal", requiredLevel: 30, mpCost: 100, healValue: 2500, desc: "HPを多量回復 (消費MP100)" },
  { id: "skill_12", name: "スターバースト・ストリーム", type: "attack", requiredLevel: 35, mpCost: 250, multiplier: 5.8, desc: "16連撃の攻撃 (消費MP250)" },
  { id: "skill_13", name: "無限の剣製", type: "attack", requiredLevel: 40, mpCost: 300, multiplier: 6.0, desc: "アンリミテッド・ブレイドワークス (消費MP300)" },
  { id: "skill_14", name: "誕生の時きたれり、其は全てを修めるもの", type: "magic", requiredLevel: 50, mpCost: 500, multiplier: 10.0, desc: "アルス・アルマデル・サロモニス (消費MP500)" }
];

// プレイヤーのステータス保持用（レベルを追加）
let playerStatus = {
  level: 1,
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
  name: "こーん魔王",
  maxHp: 20000,
  hp: 20000,
  attack: 800,
  defense: 1000
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

  const curMpEl = document.getElementById('player-current-mp');
  const maxMpEl = document.getElementById('player-max-mp');
  const mpGaugeEl = document.getElementById('player-mp-gauge');
  if (curMpEl) curMpEl.textContent = Math.max(0, playerStatus.mp);
  if (maxMpEl) maxMpEl.textContent = playerStatus.maxMp;
  if (mpGaugeEl) {
    const playerMpPercent = (playerStatus.mp / playerStatus.maxMp) * 100;
    mpGaugeEl.style.width = `${Math.max(0, playerMpPercent)}%`;
  }
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

      let baseLevel = Number(s.level) || 1; // ★ レベルの反映
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

      playerStatus.level = baseLevel;
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

// ==========================
// スキル関連の処理（レベル制限・非表示対応）
// ==========================
function showSkillSelect() {
  const container = document.getElementById('skill-buttons-container');
  if (!container) return;
  container.innerHTML = "";

  // レベルを満たしているスキルだけに絞り込む（使えない技は見えない）
  const unlockedSkills = SKILL_DATABASE.filter(skill => playerStatus.level >= skill.requiredLevel);

  if (unlockedSkills.length === 0) {
    container.innerHTML = `<p style="font-size: 14px; color: #aaa; margin: 10px 0;">使えるスキルがまだありません (Lv.1〜)</p>`;
  } else {
    unlockedSkills.forEach(skill => {
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn';

      const isMpEnough = playerStatus.mp >= skill.mpCost;

      if (!isMpEnough) {
        btn.style.backgroundColor = '#555';
        btn.style.color = '#ccc';
        btn.disabled = true;
        btn.textContent = `${skill.name} (MP不足: ${skill.mpCost})`;
      } else {
        btn.style.backgroundColor = '#9b59b6';
        btn.style.color = '#fff';
        btn.disabled = false;
        btn.textContent = `${skill.name} (MP:${skill.mpCost})`;
        
        btn.addEventListener('click', () => {
          useSkill(skill);
        });
      }

      btn.title = skill.desc;
      container.appendChild(btn);
    });
  }

  document.getElementById('command-box').style.display = 'none';
  document.getElementById('skill-command-box').style.display = 'block';
}

function hideSkillSelect() {
  document.getElementById('skill-command-box').style.display = 'none';
  document.getElementById('command-box').style.display = 'flex';
}

function useSkill(skill) {
  if (playerStatus.mp < skill.mpCost) {
    alert("MPが足りません！");
    return;
  }

  playerStatus.mp -= skill.mpCost;
  setButtonsEnabled(false);
  hideSkillSelect();

  // ★ 回復系スキルの処理
  if (skill.type === "heal") {
    playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + skill.healValue);
    updateDisplay();
    addLog(`✨ スキル発動【${skill.name}】！ HPが ${skill.healValue} 回復した！`);
    setTimeout(bossTurn, 1200);
    return;
  }

  // ★ 攻撃・魔法系スキルの処理
  let baseDmg = playerStatus.attack * skill.multiplier;
  let damage = Math.max(1, Math.floor(baseDmg - Math.floor(boss.defense / 2)));
  damage += Math.floor(Math.random() * 6) - 3;
  damage = Math.max(1, damage);

  boss.hp -= damage;
  updateDisplay();
  addLog(`✨ スキル発動【${skill.name}】！ ${boss.name} に ${damage} の大ダメージを与えた！`);

  if (boss.hp <= 0) {
    addLog(`🎉 ${boss.name} を討伐した！ 勝利！`);
    endBattle(true);
    return;
  }

  setTimeout(bossTurn, 1200);
}

// ==========================
// アイテム選択画面を開く
// ==========================
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

  document.getElementById('command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'block';
}

function hideItemSelect() {
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('command-box').style.display = 'block';
}

function useItem(itemName) {
  if (playerStatus.inventoryPotions[itemName] <= 0) {
    alert("アイテムが足りません！");
    return;
  }

  if (playerStatus.hp >= playerStatus.maxHp && !itemName.includes("MP")) {
    alert("HPはすでに満タンです！");
    return;
  }

  playerStatus.inventoryPotions[itemName]--;

  if (itemName.includes("MPポーション")) {
    const recoverMp = 200;
    playerStatus.mp = Math.min(playerStatus.maxMp, playerStatus.mp + recoverMp);
    addLog(`💧 ${itemName} を使った！ MPが ${recoverMp} 回復した！`);
  } else {
    let healAmount = 500;
    if (itemName.includes("中級")) healAmount = 1000;
    if (itemName.includes("上級")) healAmount = 2500;
    playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
    addLog(`🧪 ${itemName} を使った！ HPが ${healAmount} 回復した！`);
  }

  updateDisplay();
  hideItemSelect();
  setButtonsEnabled(false);
  setTimeout(bossTurn, 1200);
}

// ボスの反撃ターン
function bossTurn() {
  const randomVal = Math.floor(Math.random() * 10);

  if (randomVal < 3) {
    let damage = Math.max(1, boss.attack - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 4) - 2;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`⚠️ ${boss.name} の攻撃！ あなたは ${damage} のダメージを受けた！`);

  } else if (randomVal < 4) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.3) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} はラーの翼神竜を召喚！ゴッドブレイズキャノン！ ${damage} のダメージを受けた！`);

  }else if (randomVal < 5) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.5) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} はオシリスの天空龍を召喚！サンダーフォース！ ${damage} のダメージを受けた！`);

  }else if (randomVal < 6) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.3) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} はオベリスクの巨神兵を召喚！ゴッドハンドクラッシャー！ ${damage} のダメージを受けた！`);

  }else if (randomVal < 7) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.3) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} のヘルブリザード！ ${damage} のダメージを受けた！`);

  }else if (randomVal < 8) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.1) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} のリーフストーム！ ${damage} のダメージを受けた！`);

  }else if (randomVal < 9) {
    let damage = Math.max(1, Math.floor(boss.attack * 1.6) - Math.floor(playerStatus.defense / 2));
    damage += Math.floor(Math.random() * 6) - 3;
    damage = Math.max(1, damage);

    playerStatus.hp -= damage;
    updateDisplay();
    addLog(`🔥 ${boss.name} のクリムゾンフレア！ ${damage} のダメージを受けた！`);

  } else {
    let heal = 4000;
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
  const skillToggleBtn = document.getElementById('skill-select-toggle-btn');
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (skillToggleBtn) skillToggleBtn.disabled = !enabled;
  if (itemToggleBtn) itemToggleBtn.disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('skill-command-box').style.display = 'none';
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
  const skillToggleBtn = document.getElementById('skill-select-toggle-btn');
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');
  const backToMainFromSkillBtn = document.getElementById('back-to-main-from-skill-btn');
  const backToMainBtn = document.getElementById('back-to-main-btn');

  if (attackBtn) attackBtn.addEventListener('click', playerAttack);
  if (skillToggleBtn) skillToggleBtn.addEventListener('click', showSkillSelect);
  if (backToMainFromSkillBtn) backToMainFromSkillBtn.addEventListener('click', hideSkillSelect);
  if (itemToggleBtn) itemToggleBtn.addEventListener('click', showItemSelect);
  if (backToMainBtn) backToMainBtn.addEventListener('click', hideItemSelect);
});

// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-name').textContent = loggedInUser;

// メニューに戻るボタン
document.getElementById('back-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

// 装備品のステータス上昇値マスター
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

// スキルマスター（名前、必要レベル、消費MP、威力倍率、説明）
const SKILL_DATABASE = [
  { id: "skill_1", name: "全力斬り", requiredLevel: 1, mpCost: 10, multiplier: 1.5, desc: "通常より少し強い物理攻撃 (消費MP10)" },
  { id: "skill_2", name: "ヒール", requiredLevel: 3, mpCost: 15, multiplier: 2.2, desc: "少量回復 (消費MP15)" },
  { id: "skill_3", name: "フレイム", requiredLevel: 5, mpCost: 20, multiplier: 3.0, desc: "火の魔法攻撃 (消費MP20)" },
  { id: "skill_4", name: "サンダー", requiredLevel: 8, mpCost: 25, multiplier: 3.4, desc: "雷の魔法攻撃 (消費MP25)" },
  { id: "skill_5", name: "ブリザード", requiredLevel: 10, mpCost: 30, multiplier: 3.6, desc: "氷の魔法攻撃 (消費MP30)" },
  { id: "skill_6", name: "黒・魔・導", requiredLevel: 15, mpCost: 50, multiplier: 4.0, desc: "ブラック・マジック！！ (消費MP50)" },
  { id: "skill_7", name: "ハイヒール", requiredLevel: 16, mpCost: 50, multiplier: 3.0, desc: "中量回復 (消費MP50)" },
  { id: "skill_8", name: "滅びの爆裂疾風弾", requiredLevel: 20, mpCost: 70, multiplier: 5.0, desc: "滅びのバーストストリーム！！ (消費MP70)" },
  { id: "skill_9", name: "メテオバースト", requiredLevel: 23, mpCost: 80, multiplier: 5.2, desc: "メテオバースト！ (消費MP80)" },
  { id: "skill_10", name: "ダークフレア", requiredLevel: 25, mpCost: 100, multiplier: 5.5, desc: "漆黒の炎に抱かれて消えろ！ (消費MP100)" },
  { id: "skill_11", name: "神の祈り", requiredLevel: 30, mpCost: 100, multiplier: 3.0, desc: "多量回復 (消費MP100)" },
  { id: "skill_12", name: "スターバースト・ストリーム", requiredLevel: 35, mpCost: 250, multiplier: 5.8, desc: "16連撃の攻撃 (消費MP250)" },
  { id: "skill_13", name: "無限の剣製", requiredLevel: 40, mpCost: 300, multiplier: 6.0, desc: " アンリミテッド・ブレイドワークス(消費MP300)" },
  { id: "skill_14", name: "誕生の時きたれり、其は全てを修めるもの", requiredLevel: 50, mpCost: 500, multiplier: 10.0, desc: "アルス・アルマデル・サロモニス (消費MP500)" },
];

// モンスターデータベース
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
  level: 1,
  maxHp: 100,
  hp: 100,
  maxMp: 50,
  mp: 50,
  attack: 20,
  defense: 10,
  inventoryPotions: {}
};

let currentEnemy = null;
let earnedCoins = 0;
let earnedExp = 0;

// ログ出力用
function addLog(message) {
  const logBox = document.getElementById('log-box');
  logBox.innerHTML += `<br>${message}`;
  logBox.scrollTop = logBox.scrollHeight;
}

// 画面のHP・MPゲージや数値を更新
function updateDisplay() {
  if (!currentEnemy) return;

  // 敵
  document.getElementById('enemy-current-hp').textContent = Math.max(0, currentEnemy.hp);
  document.getElementById('enemy-max-hp').textContent = currentEnemy.maxHp;
  const enemyHpPercent = (currentEnemy.hp / currentEnemy.maxHp) * 100;
  document.getElementById('enemy-hp-gauge').style.width = `${Math.max(0, enemyHpPercent)}%`;

  // プレイヤー HP
  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;

  // プレイヤー MP
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

// サーバーからステータスとインベントリを取得
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
      playerStatus.defense = baseDefense;

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

fetchPlayerData();

// 難易度選択
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const diff = btn.getAttribute('data-diff');
    const list = monsterDatabase[diff];
    if (!list) return;

    const template = list[Math.floor(Math.random() * list.length)];
    currentEnemy = { ...template };
    earnedCoins = template.rewardCoins;
    earnedExp = template.rewardExp;

    document.getElementById('difficulty-select-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    document.getElementById('enemy-title').textContent = `⚔️ ${currentEnemy.name} が現れた！`;
    document.getElementById('enemy-name-display').textContent = currentEnemy.name;

    updateDisplay();
    addLog(`🔍 探索中... ${currentEnemy.name} と遭遇した！バトル開始！`);
  });
});

// 通常攻撃
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

// ==========================
// スキル関連の処理
// ==========================
function showSkillSelect() {
  const container = document.getElementById('skill-buttons-container');
  container.innerHTML = "";

  // プレイヤーのレベルを満たしているスキルだけに絞り込む
  const unlockedSkills = SKILL_DATABASE.filter(skill => playerStatus.level >= skill.requiredLevel);

  if (unlockedSkills.length === 0) {
    container.innerHTML = `<p style="font-size: 14px; color: #aaa; margin: 10px 0;">使えるスキルがまだありません (Lv.1〜)</p>`;
  } else {
    unlockedSkills.forEach(skill => {
      const btn = document.createElement('button');
      btn.className = 'ctrl-btn';

      const isMpEnough = playerStatus.mp >= skill.mpCost;

      if (!isMpEnough) {
        // レベルは足りているがMP不足の場合（押せないようにして表示）
        btn.style.backgroundColor = '#555';
        btn.style.color = '#ccc';
        btn.disabled = true;
        btn.textContent = `${skill.name} (MP不足: ${skill.mpCost})`;
      } else {
        // レベルもMPも足りている場合（通常通り使える）
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

  // スキル攻撃力計算
  let baseDmg = playerStatus.attack * skill.multiplier;
  let damage = Math.max(1, Math.floor(baseDmg - Math.floor(currentEnemy.defense / 2)));
  damage += Math.floor(Math.random() * 6) - 3;
  damage = Math.max(1, damage);

  currentEnemy.hp -= damage;
  updateDisplay();
  addLog(`✨ スキル発動【${skill.name}】！ ${currentEnemy.name} に ${damage} の大ダメージを与えた！`);

  if (currentEnemy.hp <= 0) {
    addLog(`🎉 ${currentEnemy.name} を討伐成功！`);
    endBattle(true);
    return;
  }

  setTimeout(enemyTurn, 1000);
}

// ==========================
// アイテム関連の処理
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

function hideItemSelect() {
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('command-box').style.display = 'flex';
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
    const recoverMp = 50;
    playerStatus.mp = Math.min(playerStatus.maxMp, playerStatus.mp + recoverMp);
    addLog(`💧 ${itemName} を使った！ MPが ${recoverMp} 回復した！`);
  } else {
    let healAmount = 50;
    if (itemName.includes("中級")) healAmount = 100;
    if (itemName.includes("上級")) healAmount = 200;
    playerStatus.hp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);
    addLog(`🧪 ${itemName} を使った！ HPが ${healAmount} 回復した！`);
  }

  updateDisplay();
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

// ボタン有効・無効切り替え
function setButtonsEnabled(enabled) {
  const attackBtn = document.getElementById('attack-btn');
  const skillToggleBtn = document.getElementById('skill-select-toggle-btn');
  const itemToggleBtn = document.getElementById('item-select-toggle-btn');
  const escapeBtn = document.getElementById('escape-btn');

  if (attackBtn) attackBtn.disabled = !enabled;
  if (skillToggleBtn) skillToggleBtn.disabled = !enabled;
  if (itemToggleBtn) itemToggleBtn.disabled = !enabled;
  if (escapeBtn) escapeBtn.disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('skill-command-box').style.display = 'none';
  document.getElementById('item-command-box').style.display = 'none';
  document.getElementById('to-menu-btn').style.display = 'block';

  if (isWin) {
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

function escapeBattle() {
  if (confirm("本当に逃げますか？")) {
    window.location.href = 'menu.html';
  }
}

// イベントリスナー登録
document.getElementById('attack-btn').addEventListener('click', playerAttack);
document.getElementById('skill-select-toggle-btn').addEventListener('click', showSkillSelect);
document.getElementById('back-to-main-from-skill-btn').addEventListener('click', hideSkillSelect);
document.getElementById('item-select-toggle-btn').addEventListener('click', showItemSelect);
document.getElementById('back-to-main-btn').addEventListener('click', hideItemSelect);
document.getElementById('escape-btn').addEventListener('click', escapeBattle);
document.getElementById('to-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

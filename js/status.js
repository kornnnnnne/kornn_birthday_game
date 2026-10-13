// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-display').textContent = loggedInUser;

// 装備品のステータス補正値マスター
const equipmentStats = {
  // 武器
  "銅の剣": { type: "attack", value: 10 },
  "鉄の剣": { type: "attack", value: 25 },
  "コーンの剣": { type: "attack", value: 100 },
  "伝説の剣": { type: "attack", value: 1000 },

  // 防具
  "布の服": { type: "defense", value: 5 },
  "鉄の鎧": { type: "defense", value: 20 },
  "コーンの鎧": { type: "defense", value: 100 },
  "伝説の鎧": { type: "defense", value: 500 },

  // ポーション・その他アイテム
  "初級ポーション": { type: "heal", value: 50 },
  "中級ポーション": { type: "heal", value: 100 },
  "上級ポーション": { type: "heal", value: 200 },
  "MPポーション": { type: "heal_mp", value: 50 },
  "爆薬": { type: "special", value: 0 },
  "コーン茶": { type: "heal", value: 30 },
  "願いの雫": { type: "special", value: 0 },
  "ストーリー1": { type: "story", value: 0 },
  "ストーリー2": { type: "story", value: 0 },
  "ストーリー3": { type: "story", value: 0 },
  "ストーリー4": { type: "story", value: 0 }
};

// サーバーからステータスとインベントリ情報を一括取得
function fetchStatusAndInventory() {
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

      // ★【追加】レベルと経験値（EXP）の反映
      const levelEl = document.getElementById('stat-level');
      if (levelEl) levelEl.textContent = s.level || 1;

      const expEl = document.getElementById('stat-exp');
      if (expEl) expEl.textContent = s.exp || 0;

      // ★ 次のレベルまでに必要な経験値の計算・表示
      // 例: レベルが上がるごとに必要EXPが増える場合（例: レベル * 100 など）
      // もしサーバー側から nextExp が送られてくる場合は s.nextExp を使ってもOKです
      const nextExpEl = document.getElementById('stat-next-exp');
      if (nextExpEl) {
        // サーバーから次の必要EXPが届かない場合の計算式（例: 現在レベル * 100）
        const requiredExp = s.nextExp || (currentLevel * 100);
        nextExpEl.textContent = requiredExp;
      }

      // 基本ステータス反映
      document.getElementById('stat-hp').textContent = s.hp;
      document.getElementById('stat-mp').textContent = s.mp;
      document.getElementById('stat-attack').textContent = s.attack;
      document.getElementById('stat-magicAttack').textContent = s.magicAttack;
      document.getElementById('stat-defense').textContent = s.defense;
      document.getElementById('stat-magicDefense').textContent = s.magicDefense;

      // 装備ボーナスの計算と表示
      let bonusAttack = 0;
      let bonusDefense = 0;

      if (inv.equippedWeapon && equipmentStats[inv.equippedWeapon]) {
        const eq = equipmentStats[inv.equippedWeapon];
        if (eq.type === "attack") bonusAttack += eq.value;
      }
      if (inv.equippedArmor && equipmentStats[inv.equippedArmor]) {
        const eq = equipmentStats[inv.equippedArmor];
        if (eq.type === "defense") bonusDefense += eq.value;
      }

      // ボーナス表示の更新
      const bonusAtkEl = document.getElementById('bonus-attack');
      if (bonusAtkEl) bonusAtkEl.textContent = bonusAttack > 0 ? ` (+${bonusAttack})` : "";

      const bonusDefEl = document.getElementById('bonus-defense');
      if (bonusDefEl) bonusDefEl.textContent = bonusDefense > 0 ? ` (+${bonusDefense})` : "";

      // 2. 装備・所持品反映
      document.getElementById('current-weapon').textContent = inv.equippedWeapon || "なし";
      document.getElementById('current-armor').textContent = inv.equippedArmor || "なし";

      // 武器セレクトボックスの構築
      const weaponSelect = document.getElementById('weapon-select');
      if (weaponSelect) {
        weaponSelect.innerHTML = '<option value="なし">なし</option>';
        if (inv.weapons) {
          inv.weapons.split(",").forEach(wName => {
            const opt = document.createElement('option');
            opt.value = wName;
            opt.textContent = wName;
            if (wName === inv.equippedWeapon) opt.selected = true;
            weaponSelect.appendChild(opt);
          });
        }
      }

      // 防具セレクトボックスの構築
      const armorSelect = document.getElementById('armor-select');
      if (armorSelect) {
        armorSelect.innerHTML = '<option value="なし">なし</option>';
        if (inv.armors) {
          inv.armors.split(",").forEach(aName => {
            const opt = document.createElement('option');
            opt.value = aName;
            opt.textContent = aName;
            if (aName === inv.equippedArmor) opt.selected = true;
            armorSelect.appendChild(opt);
          });
        }
      }

      // 3. 所持アイテム（ポーション等）一覧の構築
      const itemListBox = document.getElementById('inventory-item-list');
      if (itemListBox) {
        itemListBox.innerHTML = "";
        if (inv.potions && inv.potions.trim() !== "") {
          inv.potions.split(",").forEach(potionStr => {
            const [pName, pCount] = potionStr.split(":");
            const li = document.createElement('li');
            li.textContent = `${pName} × ${pCount || 1}`;
            itemListBox.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = "所持アイテムはありません";
          itemListBox.appendChild(li);
        }
      }

    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error("データ取得エラー:", err);
    alert("情報の取得に失敗しました");
  });
}

// 装備変更処理
function changeEquipment(itemType) {
  const msgBox = document.getElementById('message-box');
  if (msgBox) msgBox.textContent = "";

  let selectId = (itemType === 'weapon') ? 'weapon-select' : 'armor-select';
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;
  const itemName = selectEl.value;

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "equipItem",
      name: loggedInUser,
      itemType: itemType,
      itemName: itemName
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      if (msgBox) {
        msgBox.style.color = "#2ecc71";
        msgBox.textContent = data.message;
      }
      fetchStatusAndInventory(); // 再読み込みして最新化
    } else {
      if (msgBox) {
        msgBox.style.color = "#e74c3c";
        msgBox.textContent = data.message;
      }
    }
  })
  .catch(err => {
    console.error("装備変更エラー:", err);
    if (msgBox) {
      msgBox.style.color = "#e74c3c";
      msgBox.textContent = "通信に失敗しました";
    }
  });
}

// ページ読み込み時に実行
fetchStatusAndInventory();

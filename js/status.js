// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-display').textContent = loggedInUser;

// 装備品のステータス補正値マスター
const equipmentStats = {
  "銅の剣": { type: "attack", value: 10 },
  "鉄の剣": { type: "attack", value: 25 },
  "布の服": { type: "defense", value: 5 },
  "鉄の鎧": { type: "defense", value: 18 }
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
      bonusAtkEl.textContent = bonusAttack > 0 ? ` (+${bonusAttack})` : "";

      const bonusDefEl = document.getElementById('bonus-defense');
      bonusDefEl.textContent = bonusDefense > 0 ? ` (+${bonusDefense})` : "";

      // 2. 装備・所持品反映
      document.getElementById('current-weapon').textContent = inv.equippedWeapon;
      document.getElementById('current-armor').textContent = inv.equippedArmor;

      // 武器セレクトボックスの構築
      const weaponSelect = document.getElementById('weapon-select');
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

      // 防具セレクトボックスの構築
      const armorSelect = document.getElementById('armor-select');
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

      // 3. 所持アイテム（ポーション等）一覧の構築
      const itemListBox = document.getElementById('inventory-item-list');
      itemListBox.innerHTML = "";
      if (inv.potions && inv.potions.trim() !== "") {
        inv.potions.split(",").forEach(potionStr => {
          // 例: "ポーション:2" のような形式を分割
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
  msgBox.textContent = "";

  let selectId = (itemType === 'weapon') ? 'weapon-select' : 'armor-select';
  const itemName = document.getElementById(selectId).value;

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
      msgBox.style.color = "#2ecc71";
      msgBox.textContent = data.message;
      fetchStatusAndInventory(); // 再読み込みして最新化
    } else {
      msgBox.style.color = "#e74c3c";
      msgBox.textContent = data.message;
    }
  })
  .catch(err => {
    console.error("装備変更エラー:", err);
    msgBox.style.color = "#e74c3c";
    msgBox.textContent = "通信に失敗しました";
  });
}

// ページ読み込み時に実行
fetchStatusAndInventory();

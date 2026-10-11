// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-display').textContent = loggedInUser;

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
      // 1. ステータス反映
      const s = data.statusData;
      document.getElementById('stat-hp').textContent = s.hp;
      document.getElementById('stat-mp').textContent = s.mp;
      document.getElementById('stat-attack').textContent = s.attack;
      document.getElementById('stat-magicAttack').textContent = s.magicAttack;
      document.getElementById('stat-defense').textContent = s.defense;
      document.getElementById('stat-magicDefense').textContent = s.magicDefense;

      // 2. 装備・所持品反映
      const inv = data.inventoryData;
      document.getElementById('current-weapon').textContent = inv.equippedWeapon;
      document.getElementById('current-armor').textContent = inv.equippedArmor;

      // 武器セレクトボックスの構築
      const weaponSelect = document.getElementById('weapon-select');
      weaponSelect.innerHTML = '<option value="なし">なし</option>';
      if (inv.weapons) {
        const weaponsArr = inv.weapons.split(",");
        weaponsArr.forEach(wName => {
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
        const armorsArr = inv.armors.split(",");
        armorsArr.forEach(aName => {
          const opt = document.createElement('option');
          opt.value = aName;
          opt.textContent = aName;
          if (aName === inv.equippedArmor) opt.selected = true;
          armorSelect.appendChild(opt);
        });
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
      // 画面を再読み込みして最新の状態に更新
      fetchStatusAndInventory();
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

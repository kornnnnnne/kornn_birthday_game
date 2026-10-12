// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-name').textContent = loggedInUser;

// ショップで売っている商品のデータ定義
const shopItems = [
  { id: "sword_1", name: "銅の剣", type: "weapon", price: 100, unique: true, desc: "攻撃力 +10" },
  { id: "sword_2", name: "鉄の剣", type: "weapon", price: 300, unique: true, desc: "攻撃力 +25" },
  { id: "sword_3", name: "コーンの剣", type: "weapon", price: 1000, unique: true, desc: "攻撃力 +100" },
  { id: "sword_4", name: "伝説の剣", type: "weapon", price: 5000, unique: true, desc: "攻撃力 +1000" },
  { id: "armor_1", name: "布の服", type: "armor", price: 100, unique: true, desc: "防御力 +5" },
  { id: "armor_2", name: "鉄の鎧", type: "armor", price: 300, unique: true, desc: "防御力 +20" },
  { id: "armor_3", name: "コーンの鎧", type: "armor", price: 1000, unique: true, desc: "防御力 +100" },
  { id: "armor_4", name: "伝説の鎧", type: "armor", price: 5000, unique: true, desc: "防御力 +500" },
  { id: "potion_1", name: "初級ポーション", type: "potion", price: 30, unique: false, desc: "HPを50回復する" },
  { id: "potion_2", name: "中級ポーション", type: "potion", price: 200, unique: false, desc: "HPを100回復する" },
  { id: "potion_3", name: "上級ポーション", type: "potion", price: 500, unique: false, desc: "HPを500回復する" },
  { id: "potion_4", name: "MPポーション", type: "potion", price: 100, unique: false, desc: "100MP回復する" },
  { id: "potion_5", name: "爆薬", type: "potion", price: 100, unique: false, desc: "ランダムなダメージを与える" },
  { id: "potion_6", name: "コーン茶", type: "potion", price: 100, unique: false, desc: "おいしいお茶" },
  { id: "potion_7", name: "願いの雫", type: "potion", price: 1, unique: false, desc: "みんな大好きなもの" },
  { id: "potion_8", name: "ストーリー1", type: "potion", price: 100, unique: true, desc: "物語の開放1/4" },
  { id: "potion_9", name: "ストーリー2", type: "potion", price: 500, unique: true, desc: "物語の開放2/4" },
  { id: "potion_10", name: "ストーリー3", type: "potion", price: 1000, unique: true, desc: "物語の開放3/4" },
  { id: "potion_11", name: "ストーリー4", type: "potion", price: 2000, unique: true, desc: "物語の開放4/4" }
];

let playerCoins = 0;
let playerInventory = { weapons: "", armors: "", potions: "" };
let currentCategory = 'all'; // 現在選択されているカテゴリ

// カテゴリ切り替え関数
function switchCategory(category, btnElement) {
  currentCategory = category;
  
  // タブの見た目（アクティブ状態）を切り替える
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  btnElement.classList.add('active');

  // リストを再描画
  renderShop();
}

// 画面に商品リストを表示する
function renderShop() {
  const listContainer = document.getElementById('shop-item-list');
  listContainer.innerHTML = "";

  const ownedWeapons = playerInventory.weapons ? playerInventory.weapons.split(",") : [];
  const ownedArmors = playerInventory.armors ? playerInventory.armors.split(",") : [];
  
  let ownedPotions = [];
  if (playerInventory.potions) {
    playerInventory.potions.split(",").forEach(p => {
      const parts = p.split(":");
      ownedPotions.push(parts[0].trim());
    });
  }

  const allOwned = [...ownedWeapons, ...ownedArmors, ...ownedPotions];

  // カテゴリで絞り込み
  const filteredItems = shopItems.filter(item => {
    if (currentCategory === 'all') return true;
    return item.type === currentCategory;
  });

  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const isAlreadyOwned = item.unique && allOwned.includes(item.name);

    let buttonHtml = "";
    if (isAlreadyOwned) {
      buttonHtml = `<button class="buy-btn" disabled style="background: #555; cursor: not-allowed;">購入済み</button>`;
    } else {
      buttonHtml = `<button class="buy-btn" onclick="buyItem('${item.id}', ${item.price})">購入する</button>`;
    }

    card.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name} (${item.price} コイン)</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      ${buttonHtml}
    `;
    listContainer.appendChild(card);
  });
}

// プレイヤーの所持金やインベントリデータをサーバーから取得する関数
function fetchPlayerData() {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "getPlayerData",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      playerCoins = data.coins;
      document.getElementById('player-coins').textContent = playerCoins;
      
      if (data.inventory) {
        playerInventory = data.inventory;
      }
      
      renderShop();
    } else {
      console.error(data.message);
    }
  })
  .catch(err => {
    console.error("データ取得エラー:", err);
  });
}

// 購入処理
function buyItem(itemId, price) {
  const msgBox = document.getElementById('message-box');
  msgBox.textContent = "";
  msgBox.style.color = "#e74c3c";

  if (playerCoins < price) {
    msgBox.textContent = "コインが足りません！";
    return;
  }

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "buyItem",
      name: loggedInUser,
      itemId: itemId
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      fetchPlayerData();
      msgBox.style.color = "#2ecc71";
      msgBox.textContent = data.message;
    } else {
      msgBox.textContent = data.message;
    }
  })
  .catch(err => {
    console.error("購入エラー:", err);
    msgBox.textContent = "通信に失敗しました";
  });
}

// 初期化実行
renderShop();
fetchPlayerData();

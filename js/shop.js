// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-name').textContent = loggedInUser;

// ショップで売っている商品のデータ定義
const shopItems = [
  { id: "sword_1", name: "銅の剣", type: "weapon", price: 100, desc: "攻撃力 +10" },
  { id: "sword_2", name: "鉄の剣", type: "weapon", price: 300, desc: "攻撃力 +25" },
  { id: "armor_1", name: "布の服", type: "armor", price: 80, desc: "防御力 +5" },
  { id: "armor_2", name: "鉄の鎧", type: "armor", price: 250, desc: "防御力 +18" },
  { id: "potion_1", name: "ポーション", type: "potion", price: 30, desc: "HPを50回復する" }
];

let playerCoins = 0;

// 画面に商品リストを表示する
function renderShop() {
  const listContainer = document.getElementById('shop-item-list');
  listContainer.innerHTML = "";

  shopItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name} (${item.price} コイン)</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <button class="buy-btn" onclick="buyItem('${item.id}', ${item.price})">購入する</button>
    `;
    listContainer.appendChild(card);
  });
}

// プレイヤーの所持金やデータをサーバーから取得する関数
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
  msgBox.style.color = "#e74c3c"; // エラー時は赤色

  if (playerCoins < price) {
    msgBox.textContent = "コインが足りません！";
    return;
  }

  // サーバー（GAS）に購入リクエストを送る
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
      playerCoins = data.newCoins;
      document.getElementById('player-coins').textContent = playerCoins;
      
      // 成功メッセージを緑色で表示
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

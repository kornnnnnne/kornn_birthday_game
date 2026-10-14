// 未ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// ページを開いたときに現在のコインとインベントリを取得して表示する
const coinDisplay = document.getElementById('coin-display');

function fetchPlayerMenuData() {
  // コイン情報の取得
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "getCoins",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success" && coinDisplay) {
      coinDisplay.textContent = data.totalCoins;
    }
  })
  .catch(err => {
    console.error("コイン情報の取得に失敗しました:", err);
  });

// ステータス・インベントリ・称号情報の取得
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
      // 1. 既存のインベントリ（ポーション等）のチェック
      if (data.inventoryData) {
        checkStoryUnlock(data.inventoryData.potions);
      }
      
      // ★ 2. 称号（UsersシートのD列）のチェックを追加！
      // ※ statusData や 별도의プロパティとして称号を返すようにGAS側で調整、または専用の取得関数を通す場合
      // 下記はdata.titleなどに称号が入ってくる場合の処理例です
      if (data.title && data.title !== "なし") {
        unlockSpecialRewards(data.title);
      }
    }
  })
  .catch(err => {
    console.error("データの取得に失敗しました:", err);
  });
}

// ページを開いたときに実行！
fetchPlayerMenuData();

// プレイヤー名表示
document.getElementById('player-display').textContent = loggedInUser;

// ボタンイベント設定
document.getElementById('to-game-btn').addEventListener('click', () => {
  window.location.href = 'game1.html';
});

document.getElementById('to-quiz1-btn').addEventListener('click', () => {
  window.location.href = 'quiz1.html';
});

document.getElementById('to-quiz2-btn').addEventListener('click', () => {
  window.location.href = 'quiz2.html';
});

document.getElementById('to-KanjiQuiz-btn').addEventListener('click', () => {
  window.location.href = 'KanjiQuiz.html';
});

document.getElementById('to-Rapid-btn').addEventListener('click', () => {
  window.location.href = 'Rapid.html';
});

document.getElementById('to-slot-btn').addEventListener('click', () => {
  window.location.href = 'slot.html';
});

document.getElementById('to-shop-btn').addEventListener('click', () => {
  window.location.href = 'shop.html';
});

document.getElementById('to-status-btn').addEventListener('click', () => {
  window.location.href = 'status.html';
});

document.getElementById('to-battle-btn').addEventListener('click', () => {
  window.location.href = 'battle.html';
});

document.getElementById('to-boss-btn').addEventListener('click', () => {
  window.location.href = 'boss.html';
});

// ストーリーアイテムを所持しているかチェックしてボタンを開放する関数
function checkStoryUnlock(potionsStr) {
  if (!potionsStr) return;

  const items = potionsStr.split(",");
  
  items.forEach(itemInfo => {
    const parts = itemInfo.split(":");
    const itemName = parts[0].trim();
    const count = parseInt(parts[1]) || 0;

    if (count > 0) {
      if (itemName === "ストーリー1") {
        const btn = document.getElementById('to-story1-btn');
        if (btn) {
          btn.disabled = false;
          btn.classList.add('unlocked');
          btn.onclick = () => { window.location.href = 'story1.html'; };
        }
      } else if (itemName === "ストーリー2") {
        const btn = document.getElementById('to-story2-btn');
        if (btn) {
          btn.disabled = false;
          btn.classList.add('unlocked');
          btn.onclick = () => { window.location.href = 'story2.html'; };
        }
      } else if (itemName === "ストーリー3") {
        const btn = document.getElementById('to-story3-btn');
        if (btn) {
          btn.disabled = false;
          btn.classList.add('unlocked');
          btn.onclick = () => { window.location.href = 'story3.html'; };
        }
      } else if (itemName === "ストーリー4") {
        const btn = document.getElementById('to-story4-btn');
        if (btn) {
          btn.disabled = false;
          btn.classList.add('unlocked');
          btn.onclick = () => { window.location.href = 'story4.html'; };
        }
      }
    }
  });
}

// ★ 称号を持っている場合にストーリー1・2と製作者からを解放する関数
function unlockSpecialRewards(titleName) {
  // 1. 特別報酬エリア（称号＆製作者からボタン）を表示
  const rewardSection = document.getElementById('special-reward-section');
  const titleDisplay = document.getElementById('player-title-display');
  if (rewardSection && titleDisplay) {
    titleDisplay.textContent = `👑 称号: ${titleName}`;
    rewardSection.style.display = 'block';
  }

  // 2. 「ストーリー1」と「ストーリー2」を強制解放（thxplay.html や prologue.html へ）
  const story1Btn = document.getElementById('to-story1-btn');
  if (story1Btn) {
    story1Btn.disabled = false;
    story1Btn.classList.add('unlocked');
    story1Btn.onclick = () => { window.location.href = 'thxplay.html'; }; // ご指定のhtml名
  }

  const story2Btn = document.getElementById('to-story2-btn');
  if (story2Btn) {
    story2Btn.disabled = false;
    story2Btn.classList.add('unlocked');
    story2Btn.onclick = () => { window.location.href = 'prologue.html'; }; // ご指定のhtml名
  }

}

// ログアウト処理
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});

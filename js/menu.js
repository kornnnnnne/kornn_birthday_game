// 未ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

// ==========================================
// ★【追加】ページを開いたときに現在のコインを取得して表示する
// ==========================================
const coinDisplay = document.getElementById('coin-display');
function fetchUserCoins() {
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
}

// ページを開いたときに実行！
fetchUserCoins();
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

// ログインチェックや既存の初期化処理のあと、インベントリアイテムを反映する関数を追加

function checkStoryUnlock(potionsStr) {
  if (!potionsStr) return;

  // 所持しているポーション・ストーリーアイテムの文字列を配列に分解
  // 例: "初級ポーション:1,ストーリー1:1,ストーリー2:1"
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

// 既存のサーバーデータ取得（fetchPlayerDataなど）の中で、
// inv.potions が取得できたら上記関数に渡すように組み込んでください。
// 例:
// if (data.inventory && data.inventory.potions) {
//   checkStoryUnlock(data.inventory.potions);
// }

// ログアウト処理
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});

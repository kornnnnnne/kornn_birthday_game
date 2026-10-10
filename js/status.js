// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-display').textContent = loggedInUser;

// サーバからステータスを取得して表示
function fetchUserStatus() {
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "getStatus",
      name: loggedInUser
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      const s = data.statusData;
      document.getElementById('stat-hp').textContent = s.hp;
      document.getElementById('stat-mp').textContent = s.mp;
      document.getElementById('stat-attack').textContent = s.attack;
      document.getElementById('stat-magicAttack').textContent = s.magicAttack;
      document.getElementById('stat-defense').textContent = s.defense;
      document.getElementById('stat-magicDefense').textContent = s.magicDefense;
    } else {
      alert(data.message);
    }
  })
  .catch(err => {
    console.error("ステータス取得エラー:", err);
    alert("通信エラーが発生しました");
  });
}

// ページを開いたときに実行
fetchUserStatus();

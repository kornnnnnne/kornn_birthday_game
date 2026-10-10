// ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-name').textContent = loggedInUser;

// プレイヤーのステータス保持用
let playerStatus = {
  maxHp: 100,
  hp: 100,
  attack: 20,
  defense: 10
};

// ボスのステータス（固定）
const boss = {
  name: "コーン魔王",
  maxHp: 200,
  hp: 200,
  attack: 25,
  defense: 8
};

// ログ出力用関数
function addLog(message) {
  const logBox = document.getElementById('log-box');
  logBox.innerHTML += `<br>${message}`;
  logBox.scrollTop = logBox.scrollHeight; // 自動で一番下までスクロール
}

// 画面のHPゲージや数値を更新する関数
function updateDisplay() {
  // ボス
  document.getElementById('boss-current-hp').textContent = Math.max(0, boss.hp);
  document.getElementById('boss-max-hp').textContent = boss.maxHp;
  const bossHpPercent = (boss.hp / boss.maxHp) * 100;
  document.getElementById('boss-hp-gauge').style.width = `${Math.max(0, bossHpPercent)}%`;

  // プレイヤー
  document.getElementById('player-current-hp').textContent = Math.max(0, playerStatus.hp);
  document.getElementById('player-max-hp').textContent = playerStatus.maxHp;
  const playerHpPercent = (playerStatus.hp / playerStatus.maxHp) * 100;
  document.getElementById('player-hp-gauge').style.width = `${Math.max(0, playerHpPercent)}%`;
}

// サーバからステータスを取得
function fetchPlayerStatus() {
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
      playerStatus.maxHp = s.hp;
      playerStatus.hp = s.hp;
      playerStatus.attack = s.attack;
      playerStatus.defense = s.defense;
      updateDisplay();
      addLog("ステータスを読み込みました。バトル開始！");
    } else {
      alert(data.message);
      window.location.href = 'menu.html';
    }
  })
  .catch(err => {
    console.error("ステータス取得エラー:", err);
    alert("ステータスの読み込みに失敗しました");
  });
}

// ページ読み込み時に実行
fetchPlayerStatus();

// プレイヤーの攻撃ターン
function playerAttack() {
  // ボタンを一時的に無効化（連打防止）
  setButtonsEnabled(false);

  // ダメージ計算（攻撃力 - ボスの防御力 / 2、最低1ダメージ）
  let damage = Math.max(1, playerStatus.attack - Math.floor(boss.defense / 2));
  // 少しランダムなブレ幅を加える
  damage += Math.floor(Math.random() * 5) - 2;
  damage = Math.max(1, damage);

  boss.hp -= damage;
  updateDisplay();
  addLog(`あなたの攻撃！ ${boss.name} に ${damage} のダメージを与えた！`);

  // 勝利判定
  if (boss.hp <= 0) {
    addLog(`🎉 ${boss.name} を討伐した！ 勝利！`);
    endBattle(true);
    return;
  }

  // 1.2秒後にボスのターンへ
  setTimeout(bossTurn, 1200);
}

// ボスの反撃ターン
function bossTurn() {
  // ダメージ計算（ボスの攻撃力 - プレイヤーの防御力 / 2）
  let damage = Math.max(1, boss.attack - Math.floor(playerStatus.defense / 2));
  damage += Math.floor(Math.random() * 4) - 2;
  damage = Math.max(1, damage);

  playerStatus.hp -= damage;
  updateDisplay();
  addLog(`⚠️ ${boss.name} の攻撃！ あなたは ${damage} のダメージを受けた！`);

  // 敗北判定
  if (playerStatus.hp <= 0) {
    addLog(`💀 体力尽きた… 敗北…。`);
    endBattle(false);
    return;
  }

  // プレイヤーのターンを再開
  setButtonsEnabled(true);
}

// ボタンの有効/無効切り替え
function setButtonsEnabled(enabled) {
  document.getElementById('attack-btn').disabled = !enabled;
  document.getElementById('escape-btn').disabled = !enabled;
}

// バトル終了処理
function endBattle(isWin) {
  setButtonsEnabled(false);
  document.getElementById('command-box').style.display = 'none';
  document.getElementById('to-menu-btn').style.display = 'block';

  if (isWin) {
    // 勝利時の処理（コインなどを増やす場合はここでGASに報酬リクエストを送ることも可能）
    addLog("見事な勝利だ！ メニューに戻って次の冒険に備えよう。");
  } else {
    addLog("修行を積んで、また挑み直そう！");
  }
}

// 逃げる処理
function escapeBattle() {
  if (confirm("本当に逃げますか？")) {
    window.location.href = 'menu.html';
  }
}


let score = 0;

const scoreElement = document.getElementById('score');
const cornElement = document.getElementById('corn');
const gameArea = document.getElementById('game-area');

// とうもろこしをランダムな位置に移動させる関数
function moveCorn() {
  // ゲームエリアのサイズを取得
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  // とうもろこしが枠からはみ出ないようにランダムな座標を計算 (50pxは絵文字サイズ分)
  const randomX = Math.floor(Math.random() * (areaWidth - 60));
  const randomY = Math.floor(Math.random() * (areaHeight - 60));

  cornElement.style.left = `${randomX}px`;
  cornElement.style.top = `${randomY}px`;
}

// とうもろこしがクリック/タップされたときの処理
cornElement.addEventListener('click', () => {
  score += 10; // 10点加算
  scoreElement.textContent = score; // スコア表示を更新
  moveCorn(); // 新しい位置へ移動
});

// 初期位置に配置
moveCorn();

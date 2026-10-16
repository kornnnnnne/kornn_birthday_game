// 効果音を再生する関数
function playSE(filename) {
  const audio = new Audio(`audio/${filename}`);
  audio.volume = 0.4; // 音量（0.0 〜 1.0）
  audio.play().catch(err => {
    // ブラウザの自動再生ポリシー対策（ユーザーが一度画面を触っていれば問題ありません）
    console.log("音声の再生がブロックされました:", err);
  });
}

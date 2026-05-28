const button = document.getElementById("playButton");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "ゲームスタート！！！！！";
});

const playerName = prompt("名前を入力");

function saveScore(score) {
  localStorage.setItem(playerName + "_score", score);
}

function loadScore() {
  return localStorage.getItem(playerName + "_score");
}

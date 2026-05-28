const button = document.getElementById("playButton");
const message = document.getElementById("message");

button.addEventListener("click", () => {
  message.textContent = "ゲームスタート！";
});
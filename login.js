const GAS_URL = "https://script.google.com/macros/s/AKfycbzoRzlt3s0jk2eupKk35lmtnz6sk7w4So1gwPB6b6wddKPQbba52qRw9wYgE40sQpZxXQ/exec";

const nameInput = document.getElementById('auth-name');
const passInput = document.getElementById('auth-pass');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const msgElement = document.getElementById('auth-msg');

// メッセージ表示関数
function showMessage(text, color = "black") {
  msgElement.style.color = color;
  msgElement.textContent = text;
}

// 新規登録ボタンを押したとき
registerBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const pass = passInput.value.trim();

  if (!name || !pass) {
    showMessage("名前とパスワードを入力してください", "red");
    return;
  }

  showMessage("アカウント登録中...", "blue");

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "register",
      name: name,
      password: pass
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      showMessage("登録完了！「ログイン」を押してください", "green");
    } else {
      showMessage(data.message, "red");
    }
  })
  .catch(() => {
    showMessage("通信エラーが発生しました", "red");
  });
});

// ログインボタンを押したとき
loginBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const pass = passInput.value.trim();

  if (!name || !pass) {
    showMessage("名前とパスワードを入力してください", "red");
    return;
  }

  showMessage("ログイン確認中...", "blue");

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "login",
      name: name,
      password: pass
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      // ログイン成功情報を保存してゲーム画面へ移動
      localStorage.setItem('loggedInUser', name);
      window.location.href = 'game1.html';
    } else {
      showMessage(data.message, "red");
    }
  })
  .catch(() => {
    showMessage("通信エラーが発生しました", "red");
  });
});

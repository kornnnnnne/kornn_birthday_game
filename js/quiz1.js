// 1. ログインチェック
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.getElementById('player-display').textContent = loggedInUser;

// メニューに戻るボタン
document.getElementById('back-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});
document.getElementById('result-back-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

// --- クイズの問題集（問題プール） ---
// ここに問題を追加していくことができます！
const questionPool = [
  {
    question: "とうもろこしのひげ（絹糸）の正体は次のうちどれ？",
    choices: ["めしべ", "おしべ", "茎の一部", "根っこ"],
    answer: 0 // 正解のインデックス（0番目＝めしべ）
  },
  {
    question: "とうもろこしの原産国（発祥の地）とされる地域は？",
    choices: ["中南米（メキシコ周辺）", "東アジア", "アフリカ大陸", "ヨーロッパ"],
    answer: 0
  },
  {
    question: "日本で一番とうもろこしの生産量が多い都道府県は？",
    choices: ["千葉県", "茨城県", "北海道", "長野県"],
    answer: 2
  },
  {
    question: "ポップコーン専用のとうもろこしの品種タイプは？",
    choices: ["スイートコーン", "爆裂種（ポッピングコーン）", "デントコーン", "フリントコーン"],
    answer: 1
  },
  {
    question: "とうもろこしの一番甘みが強くなる時間帯はいつ？",
    choices: ["昼すぎ", "夕方", "深夜", "早朝"],
    answer: 3
  },
  {
    question: "とうもろこしは植物の分類としてどれにあたる？",
    choices: ["イネ科", "アブラナ科", "キク科", "ナス科"],
    answer: 0
  },
  {
    question: "スイートコーン（甘味種）の一般的な収穫時期（旬）は？",
    choices: ["1月〜3月", "4月〜5月", "6月〜9月", "11月〜12月"],
    answer: 2
  }
];

// 状態管理変数
let currentQuestions = []; // 今回選ばれた5問
let currentIndex = 0;      // 現在の問題番号 (0~4)
let score = 0;             // 現在のスコア（1問20点など）
let correctCount = 0;      // 正解数
let isAnswering = false;   // 回答連打防止フラグ

// 画面要素
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionNumberEl = document.getElementById('question-number');
const scoreDisplayEl = document.getElementById('score-display');
const questionTextEl = document.getElementById('question-text');
const choiceBtns = document.querySelectorAll('.choice-btn');
const feedbackMsgEl = document.getElementById('feedback-msg');

// --- ゲーム開始処理 ---
function initQuiz() {
  score = 0;
  correctCount = 0;
  currentIndex = 0;
  isAnswering = false;

  scoreDisplayEl.textContent = `現在のスコア: ${score}点`;
  feedbackMsgEl.textContent = "";

  quizScreen.style.display = "block";
  resultScreen.style.display = "none";

  // 配列をランダムにシャッフルして先頭から5問を抽出
  const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
  currentQuestions = shuffled.slice(0, 5);

  showQuestion();
}

// --- 問題の表示 ---
function showQuestion() {
  isAnswering = false;
  feedbackMsgEl.textContent = "";

  const q = currentQuestions[currentIndex];
  questionNumberEl.textContent = `第 ${currentIndex + 1} / 5 問`;
  questionTextEl.textContent = q.question;

  // 選択肢のセット＆ボタンの初期化
  choiceBtns.forEach((btn, index) => {
    btn.textContent = q.choices[index];
    btn.style.backgroundColor = "#007bff"; // ボタンの色をリセット
    btn.disabled = false;
  });
}

// --- 選択肢をクリックした時の処理 ---
choiceBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (isAnswering) return;
    isAnswering = true;

    const selectedIndex = parseInt(e.target.getAttribute('data-index'));
    const q = currentQuestions[currentIndex];

    // 全ボタン無効化
    choiceBtns.forEach(b => b.disabled = true);

    if (selectedIndex === q.answer) {
      // 正解
      e.target.style.backgroundColor = "#28a745"; // 緑色
      feedbackMsgEl.style.color = "#28a745";
      feedbackMsgEl.textContent = "⭕ 正解！";
      score += 20; // 1問20点
      correctCount++;
      scoreDisplayEl.textContent = `現在のスコア: ${score}点`;
    } else {
      // 不正解
      e.target.style.backgroundColor = "#dc3545"; // 赤色
      choiceBtns[q.answer].style.backgroundColor = "#28a745"; // 正解の選択肢を緑にする
      feedbackMsgEl.style.color = "#dc3545";
      feedbackMsgEl.textContent = "❌ 残念！不正解";
    }

    // 1.5秒後に次の問題または結果画面へ
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < 5) {
        showQuestion();
      } else {
        showResult();
      }
    }, 1500);
  });
});

// --- 結果画面の表示 ---
function showResult() {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";

  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('final-score').textContent = score;

  // 今後：ここで GAS にスコア保存（またはハイスコア更新）のリクエストを送ることができます！
}

// リトライボタン
document.getElementById('retry-btn').addEventListener('click', initQuiz);

// 初回起動
initQuiz();

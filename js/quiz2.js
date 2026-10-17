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
    question: "「Leo/need」の星乃一歌が担当しているパート（楽器）は何でしょう？",
    choices: ["ギター＆ボーカル", "ベース", "キーボード", "ドラム"],
    answer: 0 // 正解のインデックス（0番目＝めしべ）
  },
  {
    question: "「MORE MORE JUMP!」の桐谷遥が所属していた、国民的アイドルグループの名前は何でしょう？",
    choices: ["Vivid BAD SQUAD", "ASCRIP", "ASRUN", "RAD WEEKEND"],
    answer: 2
  },
  {
    question: "Lv1の回復スキルの回復量は？",
    choices: ["300", "350", "400", "450"],
    answer: 1
  },
  {
    question: "ユニットメモリアの変換時間は？",
    choices: ["5分", "10分", "30分", "60分"],
    answer: 1
  },
  {
    question: "奏の身長は？",
    choices: ["154", "155", "156", "157"],
    answer: 0
  },
  {
    question: "みのりの身長は？",
    choices: ["158", "159", "160", "161"],
    answer: 1
  },
  {
    question: "KAITOの身長は？",
    choices: ["170", "173", "174", "175"],
    answer: 3
  },
{
    question: "一歌の誕生日は？",
    choices: ["8月10日", "8月11日", "8月12日", "8月15日"],
    answer: 1
  },
{
    question: "穂波の誕生日は？",
    choices: ["10月25日", "10月26日", "10月27日", "10月28日"],
    answer: 2
  },
  {
    question: "志歩の身長は？",
    choices: ["159", "160", "161", "162"],
    answer: 0
  },
  {
    question: "咲希の嫌いな食べ物は？",
    choices: ["ピーマン", "おかゆ", "トマト", "セロリ"],
    answer: 1
  },
{
    question: "遥の身長は？",
    choices: ["163", "164", "165", "166"],
    answer: 0
  },
  {
    question: "雫の誕生日は？",
    choices: ["12月4日", "12月5日", "12月6日", "12月7日"],
    answer: 2
  },
  {
    question: "愛莉の好きな食べ物は？",
    choices: ["和菓子", "洋菓子", "スナック菓子", "果物"],
    answer: 0
  },
  {
    question: "こはねの誕生日は？",
    choices: ["3月1日", "3月2日", "3月3日", "3月5日"],
    answer: 1
  },
  {
    question: "杏の趣味は？",
    choices: ["カメラ", "ミント栽培", "読書", "アクセサリー作り"],
    answer: 1
  },
  {
    question: "彰人の嫌いな食べ物は？",
    choices: ["ピーマン", "ナス", "にんじん", "トマト"],
    answer: 2
  },
  {
    question: "冬弥の誕生日は？",
    choices: ["5月23日", "5月24日", "5月25日", "5月26日"],
    answer: 2
  },
  {
    question: "司の誕生日は？",
    choices: ["5月16日", "5月17日", "5月18日", "5月20日"],
    answer: 1
  },
  {
    question: "えむの好きな食べ物は？",
    choices: ["みたらし団子", "クレープ", "鯛焼き", "パフェ"],
    answer: 2
  },
  {
    question: "寧々の誕生日は？",
    choices: ["7月20日", "7月21日", "7月22日", "7月25日"],
    answer: 0
  },
  {
    question: "類の身長は？",
    choices: ["180", "181", "182", "183"],
    answer: 2
  },
  {
    question: "まふゆの誕生日は？",
    choices: ["1月25日", "1月26日", "1月27日", "1月28日"],
    answer: 2
  },
  {
    question: "絵名の嫌いな食べ物は？",
    choices: ["ピーマン", "トマト", "なす", "にんじん"],
    answer: 3
  },
  {
    question: "瑞希の誕生日は？",
    choices: ["8月27日", "8月28日", "8月29日", "8月30日"],
    answer: 0
  },
  {
    question: "メズマライザーのMASTER難易度は？",
    choices: ["29", "30", "31", "32"],
    answer: 2
  },
  {
    question: "ペンタトニックのMASTER難易度は？",
    choices: ["27", "28", "29", "30"],
    answer: 3
  },
  {
    question: "人マニアのEASY難易度は？",
    choices: ["7", "8", "9", "10"],
    answer: 1
  },
  {
    question: "エメラルドのHARD難易度は？",
    choices: ["16", "17", "18", "19"],
    answer: 2
  },
  {
    question: "判定スキルLv1の判定強化時間は？",
    choices: ["5.0", "5.5", "6.0", "6.5"],
    answer: 1
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

  // サーバーへスコアとクイズゲームの種別を送信してコインを獲得する
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      action: "saveScore",
      name: loggedInUser,
      score: score,
      gameType: "quiz" // ★ GAS側の switch で "quiz" の計算ルールが適用されます
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      // 獲得コインがある場合はポップアップ等で知らせることもできます
      if (data.earnedCoins > 0) {
        alert(`🎉 ${data.earnedCoins} コイン獲得しました！（所持金: ${data.totalCoins} コイン）`);
      }
    } else {
      console.error("スコア保存エラー:", data.message);
    }
  })
  .catch(err => {
    console.error("通信エラー:", err);
  });

  // 今後：ここで GAS にスコア保存（またはハイスコア更新）のリクエストを送ることができます！
}

// リトライボタン
document.getElementById('retry-btn').addEventListener('click', initQuiz);

// 初回起動
initQuiz();

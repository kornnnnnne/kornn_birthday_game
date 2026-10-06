document.addEventListener('DOMContentLoaded', () => {
  // 問題リスト（漢字、正解の読み方、ヒント）
  const quizList = [
    { kanji: '薔薇', answer: 'ばら', hint: '植物の名前' },
    { kanji: '海老', answer: 'えび', hint: '海の生き物' },
    { kanji: '紫陽花', answer: 'あじさい', hint: '梅雨に咲く花' },
    { kanji: '心太', answer: 'ところてん', hint: 'つるっと食べる食べ物' },
    { kanji: '翻車魚', answer: 'まんぼう', hint: 'のんびり泳ぐ魚' }
  ];

  const TIME_LIMIT = 10; // 1問あたりの制限時間（秒）

  let currentQuestionIndex = 0;
  let score = 0;
  let timeLeft = TIME_LIMIT;
  let timerId = null;

  // DOM要素
  const questionNumber = document.getElementById('question-number');
  const timeDisplay = document.getElementById('time-display');
  const scoreDisplay = document.getElementById('score-display');
  const kanjiDisplay = document.getElementById('kanji-display');
  const hintDisplay = document.getElementById('hint-display');
  const answerForm = document.getElementById('answer-form');
  const answerInput = document.getElementById('answer-input');
  const submitBtn = document.getElementById('submit-btn');
  const resultMessage = document.getElementById('result-message');
  const startBtn = document.getElementById('start-btn');

  // ゲーム開始
  function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.textContent = score;
    startBtn.style.display = 'none';

    showNextQuestion();
  }

  // 出題処理
  function showNextQuestion() {
    if (currentQuestionIndex >= quizList.length) {
      endGame();
      return;
    }

    const q = quizList[currentQuestionIndex];

    questionNumber.textContent = `${currentQuestionIndex + 1} / ${quizList.length}`;
    kanjiDisplay.textContent = q.kanji;
    hintDisplay.textContent = `ヒント: ${q.hint}`;
    resultMessage.textContent = '';
    resultMessage.className = 'result-message';

    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();

    // タイマーリセット & 開始
    clearInterval(timerId);
    timeLeft = TIME_LIMIT;
    timeDisplay.textContent = timeLeft;

    timerId = setInterval(() => {
      timeLeft--;
      timeDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleAnswer(false, '⏰ タイムオーバー！');
      }
    }, 1000);
  }

  // 回答判定
  function checkAnswer(e) {
    e.preventDefault();
    if (answerInput.disabled) return;

    clearInterval(timerId);

    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = quizList[currentQuestionIndex].answer;

    if (userAnswer === correctAnswer) {
      score++;
      scoreDisplay.textContent = score;
      handleAnswer(true, '⭕ 正解！');
    } else {
      handleAnswer(false, `❌ 不正解... （正解: ${correctAnswer}）`);
    }
  }

  // 解答後の共通処理
  function handleAnswer(isCorrect, message) {
    answerInput.disabled = true;
    submitBtn.disabled = true;

    resultMessage.textContent = message;
    resultMessage.className = `result-message ${isCorrect ? 'correct' : 'wrong'}`;

    currentQuestionIndex++;

    // 1.5秒後に次の問題へ
    setTimeout(() => {
      showNextQuestion();
    }, 1500);
  }

  // ゲーム終了
  function endGame() {
    clearInterval(timerId);
    kanjiDisplay.textContent = '終了！';
    hintDisplay.textContent = '';
    answerInput.disabled = true;
    submitBtn.disabled = true;

    resultMessage.textContent = `ゲーム終了！ スコア: ${score} / ${quizList.length}`;
    resultMessage.className = 'result-message';

    startBtn.textContent = 'もう一度挑戦する';
    startBtn.style.display = 'block';
  }

  // イベント登録
  startBtn.addEventListener('click', startGame);
  answerForm.addEventListener('submit', checkAnswer);
});

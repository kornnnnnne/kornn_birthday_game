// 1. ログインチェック（ファイルの最上部に追加！）
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
  alert("ログインが必要です");
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // 問題リスト（漢字、正解の読み方、ヒント）
  const quizList = [
  { kanji: '玉蜀黍', answer: 'とうもろこし', hint: '夏に美味しい黄色い粒の野菜' },
  { kanji: '草原', answer: 'そうげん', hint: '草が一面に生えている場所' },
  { kanji: '肥料', answer: 'ひりょう', hint: '植物を育てるための栄養' },
  { kanji: '普通', answer: 'ふつう', hint: 'ありふれていること・日常的' },
  { kanji: '譜面', answer: 'ふめん', hint: '楽譜のこと' },
  { kanji: '音楽', answer: 'おんがく', hint: '音を楽しむ芸術' },
  { kanji: '葡萄', answer: 'ぶどう', hint: '紫色の粒がたくさんつく果物' },
  { kanji: '檸檬', answer: 'れもん', hint: '黄色くて酸っぱい果物' },
  { kanji: '大蒜', answer: 'にんにく', hint: 'スタミナがつく香りの強い野菜' },
  { kanji: '生姜', answer: 'しょうが', hint: '薬味や紅茶に入れる身体が温まる野菜' },
  { kanji: '牛蒡', answer: 'ごぼう', hint: 'きんぴらに使う根菜' },
  { kanji: '陸蓮根', answer: 'おくら', hint: 'ネバネバした緑色の野菜' },
  { kanji: '甘藍', answer: 'きゃべつ', hint: 'ロール〇〇などに使う葉物野菜' },
  { kanji: '南瓜', answer: 'かぼちゃ', hint: 'ハロウィンでおなじみの甘い野菜' },
  { kanji: '蕃茄', answer: 'とまと', hint: '赤い夏野菜' },
  { kanji: '西瓜', answer: 'すいか', hint: '夏に割って食べる大きな果物' },
  { kanji: '無花果', answer: 'いちじく', hint: '花が咲かないように見える甘い果実' },
  { kanji: '海豚', answer: 'いるか', hint: 'ジャンプが得意な海の賢い動物' },
  { kanji: '海豹', answer: 'あざらし', hint: 'ゴロゴロする姿がかわいい海の哺乳類' },
  { kanji: '樹懶', answer: 'なまけもの', hint: '木にぶら下がってあまり動かない動物' },
  { kanji: '馴鹿', answer: 'となかい', hint: 'サンタクロースのソリを引く動物' },
  { kanji: '河馬', answer: 'かば', hint: '大きな口を開ける水辺の動物' },
  { kanji: '海星', answer: 'ひとで', hint: '星の形をした海の生き物' },
  { kanji: '蜥蜴', answer: 'とかげ', hint: 'チョロチョロ動く爬虫類' },
  { kanji: '蝸牛', answer: 'かたつむり', hint: '殻を背負った雨の日の生き物' },
  { kanji: '啄木鳥', answer: 'きつつき', hint: '木をツツツとつつく鳥' },
  { kanji: '蒲公英', answer: 'たんぽぽ', hint: '黄色い花が咲き、綿毛が飛ぶ植物' },
  { kanji: '向日葵', answer: 'ひまわり', hint: '太陽に向かって咲く大きな黄色い花' },
  { kanji: '紫陽花', answer: 'あじさい', hint: '梅雨に咲く花' },
  { kanji: '金木犀', answer: 'きんもくせい', hint: '秋に甘い香りを漂わせるオレンジの花' },
  { kanji: '秋桜', answer: 'こすもす', hint: 'ピンク色の秋を代表する花' },
  { kanji: '竜胆', answer: 'りんどう', hint: '秋に咲く綺麗な青紫色の花' },
  { kanji: '木綿', answer: 'もめん', hint: 'コットン・植物から取れる繊維' },
  { kanji: '硝子', answer: 'がらす', hint: 'コップや窓に使われる透明な素材' },
  { kanji: '珈琲', answer: 'こーひー', hint: '黒くて苦い人気の飲み物' },
  { kanji: '紅茶', answer: 'こうちゃ', hint: 'レモンやミルクを入れて飲むお茶' },
  { kanji: '海月', answer: 'くらげ', hint: '海をゆらゆら漂う生き物' },
  { kanji: '心太', answer: 'ところてん', hint: 'つるっと食べる食べ物' },
  { kanji: '雲丹', answer: 'うに', hint: 'トゲトゲの殻に入った高級食材' },
  { kanji: '翻車魚', answer: 'まんぼう', hint: 'のんびり泳ぐ魚' },
  { kanji: '麦酒', answer: 'びーる', hint: '大人が飲む泡のある黄金色の飲み物' },
  { kanji: '麒麟', answer: 'きりん', hint: '首がとても長い動物' },
  { kanji: '唐辛子', answer: 'とうがらし', hint: '赤くて辛いスパイス' },
  { kanji: '海馬', answer: 'たつのおとしご', hint: '龍のような姿をした海の生き物' },
  { kanji: '蝙蝠', answer: 'こうもり', hint: '夜空を飛び回る哺乳類' },
  { kanji: '土竜', answer: 'もぐら', hint: '地面の中に穴を掘って暮らす動物' },
  { kanji: '飛魚', answer: 'とびうお', hint: '海面を滑空する魚' },
  { kanji: '海象', answer: 'せいうち', hint: '大きな牙を持つ海の動物' },
  { kanji: '洗熊', answer: 'あらいぐま', hint: '手を洗うような仕草をする動物' },
  { kanji: '水豚', answer: 'かぴばら', hint: '温泉に入るのが好きな世界最大のネズミ' },
  { kanji: '越年草', answer: 'おとうし', hint: '冬を越して春に咲く植物' },
  { kanji: '甘雀', answer: 'すずめ', hint: '街中でよく見かける小さくて可愛い鳥' },
  { kanji: '雨蛙', answer: 'あまがえる', hint: '雨の日に元気に鳴く緑色の生き物' },
  { kanji: '甘蜜', answer: 'はちみつ', hint: 'ミツバチが集めた甘い蜜' },
  { kanji: '煎餅', answer: 'せんべい', hint: '米粉から作るパリッとした香ばしいお菓子' },
  { kanji: '豆腐', answer: 'とうふ', hint: '大豆から作られる白い食べ物' },
  { kanji: '納豆', answer: 'なっとう', hint: 'ネバネバした発酵食品' },
  { kanji: '団子', answer: 'だんご', hint: '串に刺さったお餅のお菓子' },
  { kanji: '心太', answer: 'ところてん', hint: '酢醤油や黒蜜で食べる夏の名物' },
  { kanji: '羊羹', answer: 'ようかん', hint: 'あんこを固めた和菓子' },
  { kanji: '蜜柑', answer: 'みかん', hint: 'コタツで食べる冬の果物' },
  { kanji: '百合', answer: 'ゆり', hint: '大きくて白い綺麗な花が咲く植物' },
  { kanji: '椿', answer: 'つばき', hint: '冬から春に赤い花を咲かせる木' },
  { kanji: '仙人掌', answer: 'さぼてん', hint: 'トゲがたくさんある砂漠の植物' },
  { kanji: '山葵', answer: 'わさび', hint: 'お寿司や刺身につける辛い薬味' },
  { kanji: '蓮華', answer: 'れんげ', hint: '田んぼなどでよく見かけるピンクの花' },
  { kanji: '眼鏡', answer: 'めがね', hint: '視力を補うためにかけるもの' },
  { kanji: '時計', answer: 'とけい', hint: '時間を教えてくれる道具' },
  { kanji: '団扇', answer: 'うちわ', hint: 'パタパタあおいで風を起こす道具' },
  { kanji: '万華鏡', answer: 'まんげきょう', hint: '覗くと綺麗な模様が見えるおもちゃ' },
  { kanji: '手紙', answer: 'てがみ', hint: '気持ちを書いて送る文章' },
  { kanji: '風車', answer: 'かざぐるま', hint: '風が吹くとくるくる回るおもちゃ' },
  { kanji: '極楽鳥', answer: 'ごくらくちょう', hint: 'とても鮮やかで綺麗な羽を持つ鳥' }
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
  }

  // イベント登録
  startBtn.addEventListener('click', startGame);
  answerForm.addEventListener('submit', checkAnswer);
});

// メニューに戻るボタン
document.getElementById('back-menu-btn').addEventListener('click', () => {
  window.location.href = 'menu.html';
});

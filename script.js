// ----- 한글 단어 목록 (매번 랜덤) -----
const wordPool = [
  "고양이", "강아지", "바다", "하늘", "학교",
  "컴퓨터", "프로그래밍", "자바스크립트", "키보드", "연습",
  "음악", "게임", "레고", "트윈클", "행성",
  "나무", "별빛", "우주", "은하", "토러스",
  "연필", "공책", "시계", "버스", "지하철",
  "초콜릿", "사과", "바나나", "딸기", "라면",
  "책상", "의자", "창문", "문", "복도",
  "연습장", "시험", "숙제", "공부", "집중",
  "인터넷", "브라우저", "깃허브", "레플릿", "코딩",
  "알고리즘", "함수", "변수", "객체", "배열"
];

// ----- DOM elements -----
const currentWordSpan = document.getElementById("currentWord");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const wordCountSelect = document.getElementById("wordCountSelect");
const difficultySelect = document.getElementById("difficultySelect");

const wordsDoneSpan = document.getElementById("wordsDone");
const wordsTotalSpan = document.getElementById("wordsTotal");
const correctCountSpan = document.getElementById("correctCount");
const wrongCountSpan = document.getElementById("wrongCount");
const timeElapsedSpan = document.getElementById("timeElapsed");
const accuracySpan = document.getElementById("accuracy");
const avgTimeSpan = document.getElementById("avgTime");
const resultMessage = document.getElementById("resultMessage");

// ----- State -----
let wordList = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let isRunning = false;

let startTime = null;
let endTime = null;
let timerIntervalId = null;

// ----- Helpers -----

function shuffle(array) {
  // Fisher–Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 난이도별로 단어 길이로 나누기 (짧은/중간/긴 단어)
function getWordsForDifficulty(difficulty, count) {
  let filtered;

  if (difficulty === "easy") {
    filtered = wordPool.filter(w => w.length <= 3); // 짧은 단어
  } else if (difficulty === "medium") {
    filtered = wordPool.filter(w => w.length >= 4 && w.length <= 6);
  } else {
    filtered = wordPool.filter(w => w.length >= 7); // 긴 단어
  }

  // 만약 필터한 단어가 너무 적으면 전체 단어 사용
  if (filtered.length < count) {
    filtered = wordPool;
  }

  const arr = [...filtered];
  shuffle(arr);
  return arr.slice(0, count);
}

function updateStats() {
  const total = wordList.length;
  const done = currentIndex;
  wordsDoneSpan.textContent = done.toString();
  wordsTotalSpan.textContent = total.toString();
  correctCountSpan.textContent = correctCount.toString();
  wrongCountSpan.textContent = wrongCount.toString();

  const elapsed = isRunning
    ? (Date.now() - startTime) / 1000
    : startTime && endTime
    ? (endTime - startTime) / 1000
    : 0;

  timeElapsedSpan.textContent = elapsed.toFixed(1);

  const attempts = correctCount + wrongCount;
  const accuracy = attempts > 0 ? (correctCount / attempts) * 100 : 0;
  accuracySpan.textContent = accuracy.toFixed(0);

  const avgTime = done > 0 ? elapsed / done : 0;
  avgTimeSpan.textContent = avgTime.toFixed(1);
}

function setCurrentWordHighlight(status) {
  currentWordSpan.classList.remove("correct", "wrong");
  if (status === "correct") currentWordSpan.classList.add("correct");
  if (status === "wrong") currentWordSpan.classList.add("wrong");
}

function showNextWord() {
  if (currentIndex >= wordList.length) {
    finishGame();
    return;
  }

  currentWordSpan.textContent = wordList[currentIndex];
  setCurrentWordHighlight(null);
  userInput.value = "";
  userInput.focus();
}

function startTimer() {
  startTime = Date.now();
  endTime = null;
  timerIntervalId = setInterval(updateStats, 100);
}

function stopTimer() {
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  endTime = Date.now();
  updateStats();
}

function resetState() {
  isRunning = false;
  wordList = [];
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  startTime = null;
  endTime = null;
  if (timerIntervalId !== null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  wordsDoneSpan.textContent = "0";
  wordsTotalSpan.textContent = "0";
  correctCountSpan.textContent = "0";
  wrongCountSpan.textContent = "0";
  timeElapsedSpan.textContent = "0.0";
  accuracySpan.textContent = "0";
  avgTimeSpan.textContent = "0.0";

  currentWordSpan.textContent = "시작 버튼을 눌러 주세요";
  setCurrentWordHighlight(null);
  resultMessage.textContent = "";

  userInput.value = "";
  userInput.disabled = true;

  startBtn.disabled = false;
  resetBtn.disabled = true;
}

// ----- Game flow -----

function startGame() {
  const count = parseInt(wordCountSelect.value, 10);
  const difficulty = difficultySelect.value;

  wordList = getWordsForDifficulty(difficulty, count);
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  isRunning = true;

  wordsTotalSpan.textContent = wordList.length.toString();
  resultMessage.textContent = "";

  userInput.disabled = false;
  userInput.value = "";
  userInput.focus();

  startBtn.disabled = true;
  resetBtn.disabled = false;

  startTimer();
  showNextWord();
}

function finishGame() {
  isRunning = false;
  stopTimer();
  userInput.disabled = true;
  setCurrentWordHighlight(null);

  const attempts = correctCount + wrongCount;
  const accuracy = attempts > 0 ? (correctCount / attempts) * 100 : 0;
  resultMessage.textContent =
    `완료! 정확도: ${accuracy.toFixed(0)}% ` +
    `(${correctCount}개 정답, ${wrongCount}개 오답)`;
}

// ----- Event listeners -----

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    startGame();
  }
});

resetBtn.addEventListener("click", () => {
  resetState();
});

userInput.addEventListener("keydown", (e) => {
  if (!isRunning) return;

  if (e.key === "Enter") {
    const typed = userInput.value.trim();
    const target = wordList[currentIndex];

    if (typed === target) {
      correctCount++;
      setCurrentWordHighlight("correct");
    } else {
      wrongCount++;
      setCurrentWordHighlight("wrong");
    }

    currentIndex++;
    updateStats();

    setTimeout(() => {
      showNextWord();
    }, 120);
  }
});

// Initial state
resetState();

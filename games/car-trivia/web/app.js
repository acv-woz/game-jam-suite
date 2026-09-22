/* Car Trivia — client-only POC game.
   Data comes from data/questions.json when served over http(s);
   falls back to the embedded copy below when opened directly via file://
   (fetch() of local files is blocked by most browsers under file://).
   Keep this in sync with data/questions.json when editing questions.

   Wrapped in an IIFE so this file can be injected as a <script> more than
   once in the same page (e.g. mounted as an MFE component, navigated away
   from, then mounted again) without "already declared" errors from
   redeclaring these top-level consts in global scope. */
(function () {

// Shared "Home" / "Leaderboard" nav — see guess-the-deal/web/app.js for the
// full write-up. window.__GAME_JAM_DATA_BASE__ is only set when embedded.
(function renderGameNav() {
  const navEl = document.getElementById("gameNav");
  if (!navEl) return;
  const embedded = !!window.__GAME_JAM_DATA_BASE__;
  let html = `<a href="${embedded ? "/game-jam" : "../../home/web/index.html"}">&larr; Home</a>`;
  if (embedded) {
    html += `<a href="/game-jam/leaderboard?game=car-trivia" class="nav-lb">Leaderboard &rarr;</a>`;
  }
  navEl.innerHTML = html;
})();

const FALLBACK_QUESTIONS = [
  { id: "ss1", theme: "supercars-speed", question: "Which Italian brand produces the Aventador and Huracán?", options: ["Lamborghini", "Maserati", "Pagani", "Alfa Romeo"], correctIndex: 0 },
  { id: "ss2", theme: "supercars-speed", question: "Which car set a production-car speed record of 240.1 mph in 1998, a record that stood for years?", options: ["Ferrari F50", "Jaguar XJ220", "McLaren F1", "Lamborghini Diablo"], correctIndex: 2 },
  { id: "ss3", theme: "supercars-speed", question: "Which American brand makes the Corvette?", options: ["Ford", "Chevrolet", "Dodge", "Pontiac"], correctIndex: 1 },
  { id: "ss4", theme: "supercars-speed", question: "Which company makes the Veyron and Chiron hypercars?", options: ["Bugatti", "Koenigsegg", "Pagani", "Rimac"], correctIndex: 0 },
  { id: "ss5", theme: "supercars-speed", question: "What lightweight material is most associated with supercar body and chassis construction?", options: ["Aluminum foam", "Carbon fiber", "Titanium sheet", "Fiberglass mesh"], correctIndex: 1 },
  { id: "ss6", theme: "supercars-speed", question: "Which Swedish manufacturer builds the Jesko and Gemera?", options: ["Koenigsegg", "Volvo Polestar", "Saab", "Zenvo"], correctIndex: 0 },
  { id: "ss7", theme: "supercars-speed", question: "The Ferrari LaFerrari, McLaren P1, and Porsche 918 Spyder are collectively nicknamed the 'Holy Trinity' of what?", options: ["Rally cars", "Hypercars", "Muscle cars", "Concept cars"], correctIndex: 1 },
  { id: "ss8", theme: "supercars-speed", question: "Which 1966 car is widely credited as the first vehicle to be called a 'supercar'?", options: ["Lamborghini Miura", "Ferrari 250 GTO", "Ford GT40", "De Tomaso Mangusta"], correctIndex: 0 },
  { id: "ss9", theme: "supercars-speed", question: "In model names like 'GT3' or 'Mustang GT', what does 'GT' commonly stand for?", options: ["Gas Turbo", "Grand Touring", "Ground Traction", "General Transport"], correctIndex: 1 },
  { id: "ss10", theme: "supercars-speed", question: "Which brand's road car, the 16.4, was the first production car to exceed 250 mph?", options: ["Bugatti Veyron", "Saleen S7", "SSC Ultimate Aero", "Pagani Zonda"], correctIndex: 0 },
  { id: "lb1", theme: "logos-branding", question: "Ferrari's badge features which animal?", options: ["A bull", "A prancing horse", "A lion", "An eagle"], correctIndex: 1 },
  { id: "lb2", theme: "logos-branding", question: "Lamborghini's logo features which animal?", options: ["A raging bull", "A prancing horse", "A stallion", "A wolf"], correctIndex: 0 },
  { id: "lb3", theme: "logos-branding", question: "Which brand's logo is three overlapping ovals?", options: ["Honda", "Toyota", "Mazda", "Nissan"], correctIndex: 1 },
  { id: "lb4", theme: "logos-branding", question: "How many interlocking rings appear in Audi's logo, one for each founding company?", options: ["3", "4", "5", "6"], correctIndex: 1 },
  { id: "lb5", theme: "logos-branding", question: "Which brand's emblem is a stylized trident, inspired by a fountain in Bologna, Italy?", options: ["Alfa Romeo", "Maserati", "Fiat", "Lancia"], correctIndex: 1 },
  { id: "lb6", theme: "logos-branding", question: "Which luxury brand's iconic hood ornament is called the 'Spirit of Ecstasy'?", options: ["Bentley", "Jaguar", "Rolls-Royce", "Aston Martin"], correctIndex: 2 },
  { id: "lb7", theme: "logos-branding", question: "Peugeot's logo features which animal?", options: ["A lion", "A panther", "A ram", "A horse"], correctIndex: 0 },
  { id: "lb8", theme: "logos-branding", question: "Porsche's crest is based on the coat of arms of which German city?", options: ["Munich", "Stuttgart", "Wolfsburg", "Ingolstadt"], correctIndex: 1 },
  { id: "lb9", theme: "logos-branding", question: "Which brand's badge is a blue oval with the company name in white script?", options: ["Ford", "Chevrolet", "Buick", "Lincoln"], correctIndex: 0 },
  { id: "lb10", theme: "logos-branding", question: "What popular myth describes the meaning behind BMW's blue-and-white circular logo?", options: ["A steering wheel", "A spinning propeller", "A racing flag", "A compass"], correctIndex: 1 },
  { id: "pc1", theme: "pop-culture-movies", question: "In Pixar's 'Cars,' what kind of vehicle is Lightning McQueen?", options: ["A tow truck", "A race car", "A pickup truck", "A school bus"], correctIndex: 1 },
  { id: "pc2", theme: "pop-culture-movies", question: "What car model is modified into a time machine in 'Back to the Future'?", options: ["Chevrolet Corvette", "DeLorean DMC-12", "Pontiac Firebird", "AMC Gremlin"], correctIndex: 1 },
  { id: "pc3", theme: "pop-culture-movies", question: "What is the name of Batman's iconic car?", options: ["The Interceptor", "The Batmobile", "The Dark Cruiser", "The Gothamite"], correctIndex: 1 },
  { id: "pc4", theme: "pop-culture-movies", question: "In the 'Transformers' franchise, which Autobot transforms into a yellow Camaro?", options: ["Optimus Prime", "Ironhide", "Bumblebee", "Jazz"], correctIndex: 2 },
  { id: "pc5", theme: "pop-culture-movies", question: "What make and model is Herbie, the sentient star of several Disney films?", options: ["Volkswagen Beetle", "Mini Cooper", "Fiat 500", "Citroën 2CV"], correctIndex: 0 },
  { id: "pc6", theme: "pop-culture-movies", question: "The 2001 film starring Vin Diesel and Paul Walker that kicked off a street-racing franchise was called what?", options: ["Need for Speed", "The Fast and the Furious", "Gone in 60 Seconds", "Days of Thunder"], correctIndex: 1 },
  { id: "pc7", theme: "pop-culture-movies", question: "In 'Ghostbusters,' Ecto-1 is a converted 1959 model of which type of vehicle?", options: ["Cadillac ambulance/hearse", "Ford police cruiser", "Chevrolet delivery van", "Checker taxi cab"], correctIndex: 0 },
  { id: "pc8", theme: "pop-culture-movies", question: "Which car does James Bond famously drive in 'Goldfinger' and several other films?", options: ["Jaguar E-Type", "Aston Martin DB5", "Lotus Esprit", "BMW Z3"], correctIndex: 1 },
  { id: "pc9", theme: "pop-culture-movies", question: "In Pixar's 'Cars,' what is the name of the rusty tow truck who becomes McQueen's best friend?", options: ["Mater", "Doc", "Sarge", "Fillmore"], correctIndex: 0 },
  { id: "pc10", theme: "pop-culture-movies", question: "The bright orange 'General Lee' is the star car of which TV show?", options: ["Knight Rider", "The Dukes of Hazzard", "CHiPs", "Starsky & Hutch"], correctIndex: 1 },
  { id: "fh1", theme: "firsts-history", question: "What is widely regarded as the first true automobile, patented in 1886?", options: ["Ford Model T", "Benz Patent-Motorwagen", "Duryea Motor Wagon", "Oldsmobile Curved Dash"], correctIndex: 1 },
  { id: "fh2", theme: "firsts-history", question: "Which company introduced the moving assembly line for mass car production in 1913?", options: ["Ford", "General Motors", "Chrysler", "Studebaker"], correctIndex: 0 },
  { id: "fh3", theme: "firsts-history", question: "What was the first mass-produced car affordable for the average American, launched in 1908?", options: ["Ford Model T", "Cadillac Model A", "Buick Model 10", "Ford Model A"], correctIndex: 0 },
  { id: "fh4", theme: "firsts-history", question: "In what year did Karl Benz patent his Motorwagen, often called the birth of the automobile?", options: ["1886", "1901", "1908", "1913"], correctIndex: 0 },
  { id: "fh5", theme: "firsts-history", question: "Which car, released by Toyota in 1997, is credited as the first mass-produced hybrid?", options: ["Toyota Corolla", "Toyota Prius", "Toyota Camry", "Toyota Crown"], correctIndex: 1 },
  { id: "fh6", theme: "firsts-history", question: "Which brand was the first to make three-point seatbelts standard equipment, in 1959?", options: ["Saab", "Mercedes-Benz", "Volvo", "Volkswagen"], correctIndex: 2 },
  { id: "fh7", theme: "firsts-history", question: "Which brand introduced the first factory-fitted driver's airbag as an option, in 1981?", options: ["Mercedes-Benz", "BMW", "Audi", "Cadillac"], correctIndex: 0 },
  { id: "fh8", theme: "firsts-history", question: "U.S. federal law began requiring seatbelts in new cars starting with which model year?", options: ["1958", "1968", "1978", "1988"], correctIndex: 1 },
  { id: "fh9", theme: "firsts-history", question: "Which 1940 Oldsmobile feature was the first mass-produced fully automatic transmission?", options: ["Powerglide", "Hydra-Matic", "Torqueflite", "Dynaflow"], correctIndex: 1 },
  { id: "fh10", theme: "firsts-history", question: "Which German automaker's original Beetle became the best-selling single car design in history?", options: ["Volkswagen", "Opel", "Audi", "Porsche"], correctIndex: 0 },
];

const THEME_ORDER = ["supercars-speed", "logos-branding", "pop-culture-movies", "firsts-history"];
const THEME_LABELS = {
  "supercars-speed": "Supercars & Speed",
  "logos-branding": "Logos & Branding",
  "pop-culture-movies": "Pop Culture & Movies",
  "firsts-history": "Firsts & History",
};

const QUESTIONS_PER_ROUND = 5;
const LEADERBOARD_KEY = "cartrivia_leaderboard";
const LEADERBOARD_MAX = 10;
// Arbitrary Monday reference for daily numbering — same convention as Lot Jam.
const EPOCH = Date.UTC(2026, 8, 14);

const state = {
  daily: [],
  currentIndex: 0,
  score: 0,
  selectedOption: null,
  answered: false,
  timerStartTs: null,
  timerInterval: null,
  elapsedMs: 0,
  finalElapsedMs: 0,
};

const el = {};
[
  "screen-start", "screen-game", "screen-end", "screen-board",
  "btnStart", "btnShowBoard", "btnBackFromBoard", "btnViewBoardEnd",
  "topbarStats", "liveScore", "liveTime",
  "progressFill", "progressLabel",
  "themeBadge", "clueQuestion", "options",
  "btnSubmit", "btnNext",
  "feedback", "feedbackBanner", "feedbackIcon", "feedbackText",
  "endRank", "endScore", "endSub", "saveScoreForm", "playerName",
  "btnPlayAgain", "boardList", "boardEmpty",
].forEach((id) => { el[id] = document.getElementById(id); });

function showScreen(name) {
  ["start", "game", "end", "board"].forEach((n) => {
    el[`screen-${n}`].hidden = n !== name;
  });
  el.topbarStats.hidden = name === "start";
}

/* Deterministic PRNG (mulberry32) so the daily pick/shuffle is identical for
   every player on a given day, but different from day to day. */
function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const rng = seededRng(seed);
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function daysSinceEpoch() {
  return Math.max(0, Math.floor((Date.now() - EPOCH) / 86400000));
}

/* One question per theme, plus a 5th "wildcard" from any theme, all picked
   deterministically from the day index — so everyone gets the same 5
   questions on the same day. Each question's options are also shuffled
   deterministically per day, so the correct answer isn't always in the same
   spot without needing per-player randomness. */
function pickDailyQuestions(pool, dayIndex) {
  const byTheme = {};
  THEME_ORDER.forEach((t) => { byTheme[t] = pool.filter((q) => q.theme === t); });

  const picks = THEME_ORDER.map((t, i) => {
    const list = byTheme[t];
    if (!list.length) return null;
    return list[(dayIndex + i * 3) % list.length];
  }).filter(Boolean);

  const usedIds = new Set(picks.map((q) => q.id));
  let extraIdx = (dayIndex * 5 + 2) % pool.length;
  let tries = 0;
  while (usedIds.has(pool[extraIdx].id) && tries < pool.length) {
    extraIdx = (extraIdx + 1) % pool.length;
    tries += 1;
  }
  picks.push(pool[extraIdx]);

  const ordered = seededShuffle(picks, dayIndex + 1000);

  return ordered.map((q, i) => {
    const optionOrder = seededShuffle([0, 1, 2, 3], dayIndex * 7 + i * 13 + 1);
    return {
      id: q.id,
      theme: q.theme,
      question: q.question,
      options: optionOrder.map((oi) => q.options[oi]),
      correctIndex: optionOrder.indexOf(q.correctIndex),
    };
  });
}

async function loadQuestions() {
  try {
    // When embedded as an MFE, this script runs inside the host page, so a
    // relative fetch would resolve against the host's URL, not this game's
    // origin. window.__GAME_JAM_DATA_BASE__ is set by the host wrapper
    // before injecting this script; standalone mode leaves it unset.
    const dataUrl = window.__GAME_JAM_DATA_BASE__
      ? `${window.__GAME_JAM_DATA_BASE__}/car-trivia/data/questions.json`
      : "../data/questions.json";
    const res = await fetch(dataUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty data");
    return data;
  } catch (e) {
    return FALLBACK_QUESTIONS;
  }
}

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function startTimer() {
  state.timerStartTs = Date.now();
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.elapsedMs = Date.now() - state.timerStartTs;
    el.liveTime.textContent = fmtTime(state.elapsedMs);
  }, 250);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.finalElapsedMs = state.elapsedMs;
}

function currentQuestion() {
  return state.daily[state.currentIndex];
}

function renderQuestion() {
  const q = currentQuestion();
  state.selectedOption = null;
  state.answered = false;

  el.themeBadge.textContent = THEME_LABELS[q.theme] || q.theme;
  el.clueQuestion.textContent = q.question;

  el.options.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ct-option";
    btn.textContent = text;
    btn.addEventListener("click", () => selectOption(i));
    el.options.appendChild(btn);
  });

  el.btnSubmit.hidden = false;
  el.btnSubmit.disabled = true;
  el.btnNext.hidden = true;

  el.progressLabel.textContent = `Question ${state.currentIndex + 1} / ${state.daily.length}`;
  el.progressFill.style.width = `${(state.currentIndex / state.daily.length) * 100}%`;

  showScreen("game");
}

function selectOption(index) {
  if (state.answered) return;
  state.selectedOption = index;
  Array.from(el.options.children).forEach((node, i) => {
    node.classList.toggle("ct-option-selected", i === index);
  });
  el.btnSubmit.disabled = false;
}

function flashFeedback(correct, correctText) {
  el.feedbackBanner.classList.remove("ct-feedback-correct", "ct-feedback-wrong");
  el.feedbackBanner.classList.add(correct ? "ct-feedback-correct" : "ct-feedback-wrong");
  el.feedbackIcon.textContent = correct ? "✅" : "❌";
  el.feedbackText.textContent = correct ? "Correct!" : `Wrong — it was "${correctText}"`;
  el.feedback.hidden = false;
  // restart the pop animation even if it just played
  el.feedbackBanner.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  el.feedbackBanner.offsetHeight;
  el.feedbackBanner.style.animation = "";
  clearTimeout(flashFeedback._timer);
  flashFeedback._timer = setTimeout(() => { el.feedback.hidden = true; }, 3300);
}

function submitAnswer() {
  if (state.selectedOption === null || state.answered) return;
  const q = currentQuestion();
  state.answered = true;

  const correct = state.selectedOption === q.correctIndex;
  if (correct) state.score += 1;

  Array.from(el.options.children).forEach((node, i) => {
    node.disabled = true;
    if (i === q.correctIndex) node.classList.add("ct-option-correct");
    else if (i === state.selectedOption) node.classList.add("ct-option-wrong");
  });

  flashFeedback(correct, q.options[q.correctIndex]);

  el.liveScore.textContent = String(state.score);
  el.btnSubmit.hidden = true;
  el.btnNext.hidden = false;

  if (state.currentIndex === state.daily.length - 1) {
    stopTimer();
  }
}

function hideFeedback() {
  clearTimeout(flashFeedback._timer);
  el.feedback.hidden = true;
}

function nextQuestion() {
  hideFeedback();
  state.currentIndex += 1;
  if (state.currentIndex >= state.daily.length) {
    endGame();
  } else {
    renderQuestion();
  }
}

function rankForScore(score, max) {
  if (score === max) return "🏆 Perfect Round";
  if (score >= max * 0.8) return "🥇 Trivia Ace";
  if (score >= max * 0.6) return "🥈 Gearhead";
  if (score >= max * 0.4) return "🥉 Backseat Driver";
  return "🌱 Still Learning the Ropes";
}

function endGame() {
  el.progressFill.style.width = "100%";
  el.endRank.textContent = rankForScore(state.score, state.daily.length);
  el.endScore.textContent = `${state.score} / ${state.daily.length}`;
  el.endSub.textContent = `Finished in ${fmtTime(state.finalElapsedMs)}`;
  el.playerName.value = "";
  showScreen("end");
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveLeaderboardEntry(name, score, timeMs) {
  try {
    const list = loadLeaderboard();
    list.push({ name: name || "Anonymous", score, timeMs, date: new Date().toISOString() });
    // higher score wins; ties broken by whoever finished faster
    list.sort((a, b) => (b.score - a.score) || (a.timeMs - b.timeMs));
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, LEADERBOARD_MAX)));
  } catch (e) {
    /* localStorage unavailable — leaderboard just won't persist */
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderLeaderboard() {
  const list = loadLeaderboard();
  el.boardEmpty.hidden = list.length > 0;
  el.boardList.innerHTML = list
    .map(
      (entry, i) => `<li>
        <span class="ct-board-rank">#${i + 1}</span>
        <span class="ct-board-name">${escapeHtml(entry.name)}</span>
        <span class="ct-board-time">${fmtTime(entry.timeMs || 0)}</span>
        <span class="ct-board-score">${entry.score}</span>
      </li>`
    )
    .join("");
}

function startGame() {
  state.currentIndex = 0;
  state.score = 0;
  el.liveScore.textContent = "0";
  el.liveTime.textContent = "0:00";
  state.elapsedMs = 0;
  state.finalElapsedMs = 0;
  startTimer();
  renderQuestion();
}

function bindEvents() {
  el.btnStart.addEventListener("click", startGame);
  el.btnShowBoard.addEventListener("click", () => {
    renderLeaderboard();
    showScreen("board");
  });
  el.btnBackFromBoard.addEventListener("click", () => showScreen("start"));
  el.btnViewBoardEnd.addEventListener("click", () => {
    renderLeaderboard();
    showScreen("board");
  });

  el.btnSubmit.addEventListener("click", submitAnswer);
  el.btnNext.addEventListener("click", nextQuestion);

  el.saveScoreForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveLeaderboardEntry(el.playerName.value.trim(), state.score, state.finalElapsedMs);
    renderLeaderboard();
    showScreen("board");
  });

  el.btnPlayAgain.addEventListener("click", startGame);
}

async function init() {
  bindEvents();
  const pool = await loadQuestions();
  state.daily = pickDailyQuestions(pool, daysSinceEpoch());
  showScreen("start");
}

init();

})();

/* Guess the Deal — client-only POC game.
   Data comes from data/seed-rounds.json when served over http(s);
   falls back to the embedded copy below when opened directly via file://
   (fetch() of local files is blocked by most browsers under file://). */

const FALLBACK_ROUNDS = [
  { id: "r1", mode: "price", vehicle: { year: 2019, make: "Honda", model: "CR-V", trim: "EX-L AWD", bodyStyle: "SUV", color: "Modern Steel Metallic", conditionNotes: "Clean title, minor curb rash on rear passenger wheel, interior excellent", region: "Midwest", daysOnLot: 3 }, mileage: 42150, price: 21800 },
  { id: "r2", mode: "mileage", vehicle: { year: 2021, make: "Ford", model: "F-150", trim: "XLT SuperCrew 4x4", bodyStyle: "Truck", color: "Agate Black", conditionNotes: "Bed liner installed, small dent on tailgate, tires at 80%", region: "South", daysOnLot: 6 }, mileage: 38900, price: 34200 },
  { id: "r3", mode: "price", vehicle: { year: 2020, make: "Tesla", model: "Model 3", trim: "Long Range AWD", bodyStyle: "Sedan", color: "Pearl White", conditionNotes: "One owner, autopilot hardware 3.0, battery health 96%", region: "West", daysOnLot: 1 }, mileage: 51200, price: 27900 },
  { id: "r4", mode: "mileage", vehicle: { year: 2017, make: "Toyota", model: "Camry", trim: "SE", bodyStyle: "Sedan", color: "Celestial Silver", conditionNotes: "Fleet vehicle, well maintained, small windshield chip", region: "Northeast", daysOnLot: 9 }, mileage: 89400, price: 12600 },
  { id: "r5", mode: "price", vehicle: { year: 2022, make: "Jeep", model: "Wrangler", trim: "Rubicon 4-Door", bodyStyle: "SUV", color: "Firecracker Red", conditionNotes: "Aftermarket lift kit, off-road tires, otherwise stock", region: "Mountain", daysOnLot: 4 }, mileage: 21300, price: 41500 },
  { id: "r6", mode: "mileage", vehicle: { year: 2018, make: "Chevrolet", model: "Silverado 1500", trim: "LT Crew Cab", bodyStyle: "Truck", color: "Summit White", conditionNotes: "Tow package, some paint fade on hood, mechanically sound", region: "South", daysOnLot: 11 }, mileage: 96700, price: 22300 },
  { id: "r7", mode: "price", vehicle: { year: 2020, make: "BMW", model: "3 Series", trim: "330i xDrive", bodyStyle: "Sedan", color: "Jet Black", conditionNotes: "Sport package, minor curb rash on two wheels, recent brake service", region: "Northeast", daysOnLot: 5 }, mileage: 33800, price: 28700 },
  { id: "r8", mode: "mileage", vehicle: { year: 2016, make: "Nissan", model: "Altima", trim: "SV", bodyStyle: "Sedan", color: "Gun Metallic", conditionNotes: "Rental history, average interior wear, new tires all around", region: "South", daysOnLot: 14 }, mileage: 104200, price: 9800 },
  { id: "r9", mode: "price", vehicle: { year: 2021, make: "Subaru", model: "Outback", trim: "Limited", bodyStyle: "Wagon/SUV", color: "Wilderness Green", conditionNotes: "One owner, non-smoker, small scratch on rear bumper", region: "Northeast", daysOnLot: 2 }, mileage: 29600, price: 26100 },
  { id: "r10", mode: "mileage", vehicle: { year: 2019, make: "Mazda", model: "CX-5", trim: "Grand Touring", bodyStyle: "SUV", color: "Machine Gray", conditionNotes: "Leather seats show light wear, service records complete", region: "West", daysOnLot: 7 }, mileage: 47800, price: 19500 },
  { id: "r11", mode: "price", vehicle: { year: 2015, make: "Hyundai", model: "Elantra", trim: "SE", bodyStyle: "Sedan", color: "Titanium Gray", conditionNotes: "Budget unit, cosmetic wear throughout, runs and drives well", region: "Midwest", daysOnLot: 18 }, mileage: 118500, price: 6900 },
  { id: "r12", mode: "mileage", vehicle: { year: 2022, make: "Kia", model: "Telluride", trim: "SX Prestige", bodyStyle: "SUV", color: "Ebony Black", conditionNotes: "Loaded trim, showroom condition, single owner", region: "South", daysOnLot: 2 }, mileage: 18200, price: 43800 },
  { id: "r13", mode: "price", vehicle: { year: 2020, make: "Audi", model: "Q5", trim: "Premium Plus", bodyStyle: "SUV", color: "Glacier White", conditionNotes: "Panoramic roof, minor wear on driver seat bolster", region: "Northeast", daysOnLot: 8 }, mileage: 40100, price: 31200 },
  { id: "r14", mode: "mileage", vehicle: { year: 2023, make: "Ram", model: "1500", trim: "Big Horn Crew Cab", bodyStyle: "Truck", color: "Diamond Black", conditionNotes: "Like new, bed cover installed, no accidents reported", region: "Mountain", daysOnLot: 1 }, mileage: 9800, price: 38900 }
];

const ROUNDS_PER_GAME = 12;
const STREAK_BONUS_THRESHOLD = 3;
const STREAK_BONUS_POINTS = 100;
const QUALIFYING_SCORE = 650;
const LEADERBOARD_KEY = "gtd_leaderboard";
const LEADERBOARD_MAX = 10;

const state = {
  allRounds: [],
  order: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
};

const el = {};
[
  "screen-start", "screen-game", "screen-reveal", "screen-end", "screen-board",
  "btnStart", "btnShowBoard", "btnBackFromBoard", "btnViewBoardEnd",
  "topbarScore", "liveScore", "liveStreak",
  "progressFill", "progressLabel",
  "vehicleTitle", "vehicleTrim", "specGrid", "conditionNotes", "carSvg",
  "guessQuestion", "guessPrefix", "guessSuffix", "guessNumber", "guessSlider", "btnSubmitGuess",
  "revealTier", "revealGuess", "revealActual", "revealBarFill", "revealBarMarker",
  "revealOff", "revealPoints", "revealStreakBonus", "btnNextRound",
  "endRank", "endScore", "endSub", "saveScoreForm", "playerName",
  "btnPlayAgain", "boardList", "boardEmpty",
].forEach((id) => { el[id] = document.getElementById(id); });

function showScreen(name) {
  ["start", "game", "reveal", "end", "board"].forEach((n) => {
    el[`screen-${n}`].hidden = n !== name;
  });
  el.topbarScore.hidden = name === "start";
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function loadRounds() {
  try {
    const res = await fetch("../data/seed-rounds.json", { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("empty data");
    return data;
  } catch (e) {
    return FALLBACK_ROUNDS;
  }
}

function formatCurrency(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function formatMiles(n) {
  return Math.round(n).toLocaleString("en-US") + " mi";
}

function animateNumber(node, from, to, duration = 500) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(from + (to - from) * eased);
    node.textContent = val.toLocaleString("en-US");
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function currentRound() {
  return state.allRounds[state.order[state.currentIndex]];
}

function getSliderConfig(round) {
  const target = round.mode === "price" ? round.price : round.mileage;
  const step = round.mode === "price" ? 50 : 250;
  let max = Math.ceil((target * 2.3) / step) * step;
  if (max < step * 20) max = step * 20;
  return { min: 0, max, step, defaultValue: Math.round(max / 2 / step) * step };
}

function renderRound() {
  const round = currentRound();
  const v = round.vehicle;

  el.vehicleTitle.textContent = `${v.year} ${v.make} ${v.model}`;
  el.vehicleTrim.textContent = v.trim;
  el.conditionNotes.textContent = `"${v.conditionNotes}"`;

  const specs = [
    ["Body style", v.bodyStyle],
    ["Color", v.color],
    ["Region", v.region],
    ["Days on lot", v.daysOnLot],
  ];
  if (round.mode === "price") specs.push(["Mileage", formatMiles(round.mileage)]);
  if (round.mode === "mileage") specs.push(["Sale price", formatCurrency(round.price)]);

  el.specGrid.innerHTML = specs
    .map(([label, value]) => `<div class="spec-item"><span class="spec-label">${label}</span><span class="spec-value">${value}</span></div>`)
    .join("");

  el.guessQuestion.textContent =
    round.mode === "price" ? "What did this sell for?" : "What's the mileage on this one?";
  el.guessPrefix.textContent = round.mode === "price" ? "$" : "";
  el.guessSuffix.textContent = round.mode === "price" ? "" : "mi";

  const cfg = getSliderConfig(round);
  el.guessSlider.min = cfg.min;
  el.guessSlider.max = cfg.max;
  el.guessSlider.step = cfg.step;
  el.guessSlider.value = cfg.defaultValue;
  el.guessNumber.value = cfg.defaultValue;
  el.guessNumber.min = cfg.min;
  el.guessNumber.max = cfg.max;
  el.guessNumber.step = cfg.step;

  el.progressLabel.textContent = `Round ${state.currentIndex + 1} / ${state.order.length}`;
  el.progressFill.style.width = `${(state.currentIndex / state.order.length) * 100}%`;

  el.carSvg.classList.remove("pop");
  requestAnimationFrame(() => el.carSvg.classList.add("pop"));

  showScreen("game");
}

function scoreForGuess(guess, actual) {
  const pctError = Math.abs(guess - actual) / actual;
  const raw = 1000 * Math.exp(-pctError * 9);
  return { points: Math.max(0, Math.round(raw)), pctError };
}

function tierForPoints(points) {
  if (points >= 850) return "🎯 Nailed it!";
  if (points >= QUALIFYING_SCORE) return "👍 Great guess!";
  if (points >= 400) return "🙂 Not bad";
  if (points >= 150) return "😬 Way off";
  return "🥴 Total whiff";
}

let pendingRoundResult = null;

function submitGuess() {
  const round = currentRound();
  const guess = Number(el.guessNumber.value);
  if (Number.isNaN(guess) || guess < 0) {
    el.guessNumber.classList.add("shake");
    setTimeout(() => el.guessNumber.classList.remove("shake"), 400);
    return;
  }

  const actual = round.mode === "price" ? round.price : round.mileage;
  const { points, pctError } = scoreForGuess(guess, actual);

  const qualifies = points >= QUALIFYING_SCORE;
  state.streak = qualifies ? state.streak + 1 : 0;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  const bonus = state.streak >= STREAK_BONUS_THRESHOLD ? STREAK_BONUS_POINTS : 0;

  pendingRoundResult = { round, guess, actual, points, bonus, pctError };

  const prevScore = state.score;
  state.score = prevScore + points + bonus;

  showReveal(pendingRoundResult, prevScore);
}

function showReveal(result, prevScore) {
  const { round, guess, actual, points, bonus, pctError } = result;
  const tierLabel = tierForPoints(points);
  const isPrice = round.mode === "price";
  const fmt = isPrice ? formatCurrency : formatMiles;

  el.revealTier.textContent = tierLabel;
  el.revealGuess.textContent = fmt(guess);
  el.revealActual.textContent = fmt(actual);
  el.revealOff.textContent = `${(pctError * 100).toFixed(1)}% off`;

  const cfg = getSliderConfig(round);
  const range = cfg.max - cfg.min || 1;
  const markerPct = Math.min(100, Math.max(0, ((guess - cfg.min) / range) * 100));
  el.revealBarMarker.style.left = `${markerPct}%`;

  el.revealPoints.textContent = `+${points}`;
  if (bonus > 0) {
    el.revealStreakBonus.hidden = false;
    el.revealStreakBonus.textContent = `🔥 streak bonus +${bonus}`;
  } else {
    el.revealStreakBonus.hidden = true;
  }

  el.liveStreak.hidden = state.streak < 2;
  el.liveStreak.textContent = `🔥 x${state.streak}`;

  showScreen("reveal");
  animateNumber(el.liveScore, prevScore, state.score, 600);
  el.revealPoints.classList.remove("pop");
  requestAnimationFrame(() => el.revealPoints.classList.add("pop"));
}

function nextRound() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.order.length) {
    endGame();
  } else {
    renderRound();
  }
}

function rankForScore(score, maxScore) {
  const pct = score / maxScore;
  if (pct >= 0.82) return "🏆 Master Appraiser";
  if (pct >= 0.65) return "🥇 Sharp Appraiser";
  if (pct >= 0.48) return "🥈 Solid Appraiser";
  if (pct >= 0.3) return "🥉 Getting There";
  return "🌱 Rookie Guesser";
}

function endGame() {
  const maxScore = state.order.length * 1000;
  el.endRank.textContent = rankForScore(state.score, maxScore);
  el.endSub.textContent = `out of ${maxScore.toLocaleString("en-US")} possible · best streak x${state.bestStreak}`;
  el.playerName.value = "";
  showScreen("end");
  animateNumber(el.endScore, 0, state.score, 900);
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

function saveLeaderboardEntry(name, score) {
  try {
    const list = loadLeaderboard();
    list.push({ name: name || "Anonymous", score, date: new Date().toISOString() });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, LEADERBOARD_MAX);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch (e) {
    /* localStorage unavailable — leaderboard just won't persist */
  }
}

function renderLeaderboard() {
  const list = loadLeaderboard();
  el.boardEmpty.hidden = list.length > 0;
  el.boardList.innerHTML = list
    .map(
      (entry, i) => `<li>
        <span class="board-rank">#${i + 1}</span>
        <span class="board-name">${escapeHtml(entry.name)}</span>
        <span class="board-score">${entry.score.toLocaleString("en-US")}</span>
      </li>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function startGame() {
  state.order = shuffle(state.allRounds.map((_, i) => i)).slice(0, Math.min(ROUNDS_PER_GAME, state.allRounds.length));
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  el.liveScore.textContent = "0";
  el.liveStreak.hidden = true;
  renderRound();
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

  el.btnSubmitGuess.addEventListener("click", submitGuess);
  el.guessNumber.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess();
  });
  el.guessSlider.addEventListener("input", () => {
    el.guessNumber.value = el.guessSlider.value;
  });
  el.guessNumber.addEventListener("input", () => {
    const v = Number(el.guessNumber.value);
    if (!Number.isNaN(v)) el.guessSlider.value = String(v);
  });

  el.btnNextRound.addEventListener("click", nextRound);

  el.saveScoreForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveLeaderboardEntry(el.playerName.value.trim(), state.score);
    renderLeaderboard();
    showScreen("board");
  });

  el.btnPlayAgain.addEventListener("click", startGame);
}

async function init() {
  bindEvents();
  state.allRounds = await loadRounds();
  showScreen("start");
}

init();

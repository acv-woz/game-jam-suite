<template>
  <div class="leaderboard-page">
    <GameJamBackButton />

    <div class="lp-wrap">
      <header class="lp-top">
        <div class="lp-title-block">
          <h1>Leaderboard</h1>
          <p class="lp-tagline">See how dealers rank in each game, by day or by week.</p>
        </div>
      </header>

      <div class="lp-config">
        <div class="lp-config-row">
          <div class="lp-config-group">
            <label
              class="lp-config-label"
              for="lpGameSelect"
            >Game</label>
            <select
              id="lpGameSelect"
              v-model="gameId"
              class="lp-select"
            >
              <option
                v-for="g in GAMES"
                :key="g.id"
                :value="g.id"
              >{{ g.name }}</option>
            </select>
          </div>
          <div class="lp-config-group">
            <label class="lp-config-label">Cycle</label>
            <div class="lp-seg">
              <button
                type="button"
                :class="{ active: cycle === 'daily' }"
                @click="cycle = 'daily'"
              >Daily</button>
              <button
                type="button"
                :class="{ active: cycle === 'weekly' }"
                @click="cycle = 'weekly'"
              >Weekly</button>
            </div>
          </div>
          <div
            v-if="cycle === 'weekly'"
            class="lp-config-group"
          >
            <label class="lp-config-label">Weekly formula <span class="lp-tbd-flag">TBD</span></label>
            <div class="lp-seg">
              <button
                type="button"
                :class="{ active: agg === 'best' }"
                @click="agg = 'best'"
              >Best day</button>
              <button
                type="button"
                :class="{ active: agg === 'sum' }"
                @click="agg = 'sum'"
              >Sum</button>
              <button
                type="button"
                :class="{ active: agg === 'avg' }"
                @click="agg = 'avg'"
              >Average</button>
            </div>
          </div>
          <div class="lp-config-group">
            <label class="lp-config-label">Dealer identity</label>
            <div class="lp-seg">
              <button
                type="button"
                :class="{ active: identity === 'username' }"
                @click="identity = 'username'"
              >Username</button>
              <button
                type="button"
                :class="{ active: identity === 'real' }"
                @click="identity = 'real'"
              >Real name</button>
            </div>
          </div>
        </div>
        <div class="lp-config-row">
          <div
            v-if="cycle === 'daily'"
            class="lp-config-group"
          >
            <label class="lp-config-label">Day</label>
            <div class="lp-day-seg">
              <button
                v-for="(d, i) in weekDates"
                :key="d.toISOString()"
                type="button"
                :class="{ active: day === i, 'free-play': d.getDay() === 0 }"
                @click="day = i"
              >{{ formatDay(d) }}{{ d.getDay() === 0 ? ' ☀' : '' }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="lp-board-wrap">
        <div class="lp-board-head">
          <h2>{{ boardTitle }}</h2>
          <p class="lp-sub">{{ boardSub }}</p>
        </div>

        <div
          v-if="!rankedEntries.length"
          class="lp-empty"
        >
          <span class="glyph">{{ isFreePlay ? '☀' : '—' }}</span>
          {{ isFreePlay
            ? 'Sunday is free play — dealers can still play for fun, but nothing posts to the daily or weekly leaderboard today.'
            : 'No qualifying scores yet for this view.' }}
        </div>

        <ol
          v-else
          class="lp-list"
        >
          <LeaderboardRow
            v-for="entry in top20"
            :key="entry.dealerId"
            :entry="entry"
            :game="game"
            :name="dealerName(dealerById(entry.dealerId))"
            :avatar-color="avatarColor(entry.dealerId)"
          />
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import GameJamBackButton from '../shared/GameJamBackButton.vue';
import LeaderboardRow from './LeaderboardRow.vue';

// Each entry matches an actual game we've built (see the routes this remote
// exposes) rather than a made-up set — unit/better/min/max/fmt describe how
// that game's own scoring already works.
const GAMES = [
  { id: 'guess-the-deal', name: 'Guess the Deal', unit: 'pts', better: 'high', min: 380, max: 1180, step: 10, fmt: 'plain' },
  { id: 'lot-jam', name: 'Lot Jam', unit: 's', better: 'low', min: 16, max: 140, step: 1, fmt: 'time' },
  { id: 'car-trivia', name: 'Car Trivia', unit: 'pts', better: 'high', min: 0, max: 5, step: 1, fmt: 'plain' },
  { id: 'cardle', name: 'Cardle', unit: 'guesses', better: 'low', min: 1, max: 6, step: 1, fmt: 'plain' },
  { id: 'reveal-the-deal', name: 'Reveal the Deal', unit: 'guesses', better: 'low', min: 1, max: 6, step: 1, fmt: 'plain' },
  { id: 'route-runner', name: 'Route Runner', unit: 's', better: 'low', min: 20, max: 150, step: 1, fmt: 'time' },
];
const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REAL_NAMES = ['Marcus Ibe', 'Priya Anand', 'Dana Kowalski', 'Leon Fischer', 'Grace Okafor', 'Tomás Rivera', 'Wendy Park',
  'Andre Silva', 'Naomi Cohen', 'Caleb Stroud', 'Renee Duval', 'Sam Whitfield', 'Julia Ferreira', 'Owen Marsh', 'Ines Castillo',
  'Tyler Bloom', 'Priyanka Rao', 'Dmitri Volkov', 'Alicia Nguyen', 'Ben Harding', 'Farah Haddad', 'Carter Voss',
  "Meg O'Sullivan", 'Rafael Cruz', 'Simone Laurent', 'Jordan Blake', 'Nadia Petrov', 'Evan McAllister'];
const USERNAMES = ['LotShark88', 'LastBidLarry', 'LaneNineLegend', 'ClearTitleClaire', 'GavelGuy', 'TradeInTitan', 'MileageMaven',
  'CurbAppealChris', 'AuctionAceDeb', 'RunAndDriveRon', 'FloorboardFinn', 'ArbitrationAnnie', 'BlockPartyBlaine', 'OvernightOffer',
  'SightUnseenSue', 'HighBidHannah', 'ReserveRae', 'CleanCarfaxCody', 'FrameOffFreddy', 'ThirdPartyTerry', 'PowerTrainPete',
  'VinDecoderVic', 'ClosingBellCarl', 'FairMarketFiona', 'ProxyBidPaula', 'LaneChangeLuis', 'CertifiedCarla', 'SalvageSavvySam'];

const AVATAR_TINTS = ['#8074cf', '#4f8fae', '#5a9a73', '#c06a56', '#6c7480', '#a8791b'];

const DEALERS = REAL_NAMES.map((name, i) => ({ id: `d${i}`, realName: name, username: USERNAMES[i] }));

// The last 7 real calendar days ending today (index 6 = today), so the day
// picker shows actual dates instead of an abstract "day 0-6" — and, unlike
// anchoring to a Sunday-start calendar week, this never shows a date that
// hasn't happened yet. Scores below are still simulated for demonstration,
// not live data.
function lastSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
}
const weekDates = lastSevenDays();

function formatDay(d) {
  return `${DAY_SHORT[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

function rand(min, max, step) {
  const n = min + Math.random() * (max - min);
  return Math.round(n / step) * step;
}
function randomScoreFor(g) { return rand(g.min, g.max, g.step); }
function betterOf(a, b, better) {
  if (a == null) return b;
  if (b == null) return a;
  return better === 'high' ? Math.max(a, b) : Math.min(a, b);
}

// base[gameId][dayIndex][dealerId] = score | undefined, regenerated fresh per page load.
const base = {};
GAMES.forEach((g) => {
  base[g.id] = [];
  for (let d = 0; d < 7; d += 1) {
    const dayMap = {};
    DEALERS.forEach((dealer) => {
      if (Math.random() < 0.78) dayMap[dealer.id] = randomScoreFor(g);
    });
    base[g.id].push(dayMap);
  }
});
// Force at least one visible tie near the top of each game's board for
// today (the default view), so the shared-rank rule always has something
// to demonstrate on load.
GAMES.forEach((g) => {
  const todayBoard = base[g.id][6];
  const ids = Object.keys(todayBoard);
  if (ids.length >= 2) todayBoard[ids[0]] = todayBoard[ids[1]];
});

// Each game's "Leaderboard →" link (see games/guess-the-deal/web/app.js's
// renderGameNav) points here with `?game=<slug>`, so arriving from a
// specific game pre-selects it in the dropdown instead of always
// defaulting to the first one.
function initialGameId() {
  try {
    const requested = new URLSearchParams(window.location.search).get('game');
    return GAME_BY_ID[requested] ? requested : GAMES[0].id;
  } catch (e) {
    return GAMES[0].id;
  }
}
const gameId = ref(initialGameId());
const cycle = ref('daily');
const agg = ref('best');
const identity = ref('username');
const day = ref(6);

const game = computed(() => GAME_BY_ID[gameId.value]);
const isWeekly = computed(() => cycle.value === 'weekly');
const isSunday = computed(() => weekDates[day.value].getDay() === 0);
const isFreePlay = computed(() => !isWeekly.value && isSunday.value);

function dealerName(dealer) { return identity.value === 'username' ? dealer.username : dealer.realName; }
function dealerById(id) { return DEALERS.find((d) => d.id === id); }

function effectiveScore(gId, d, dealerId) { return base[gId][d][dealerId]; }
function effectiveEntries(gId, d) {
  const out = [];
  DEALERS.forEach((dealer) => {
    const score = effectiveScore(gId, d, dealer.id);
    if (score != null) out.push({ dealerId: dealer.id, score });
  });
  return out;
}

// Standard competition ranking: ties share a rank, the next distinct score
// resumes at its true 1-based position (so a tie for 1st is followed by 3rd).
function rankEntries(entries, better) {
  const sorted = [...entries].sort((a, b) => (better === 'high' ? b.score - a.score : a.score - b.score));
  const out = [];
  let prevScore = null;
  let prevRank = 0;
  sorted.forEach((e, i) => {
    const rank = (prevScore !== null && e.score === prevScore) ? prevRank : i + 1;
    out.push({ dealerId: e.dealerId, score: e.score, rank });
    prevScore = e.score;
    prevRank = rank;
  });
  return out;
}

function weeklyWindow(d) {
  // Every shown day up through `d`, except Sundays — Sunday is free play and
  // never contributes to the weekly aggregate, regardless of which 7 dates
  // are currently on screen.
  return Array.from({ length: d + 1 }, (_, i) => i).filter((i) => weekDates[i].getDay() !== 0);
}
function weeklyEntries(gId, d, aggMode) {
  const g = GAME_BY_ID[gId];
  const days = weeklyWindow(d);
  const out = [];
  DEALERS.forEach((dealer) => {
    const scores = [];
    days.forEach((dd) => {
      const s = effectiveScore(gId, dd, dealer.id);
      if (s != null) scores.push(s);
    });
    if (!scores.length) return;
    let value;
    if (aggMode === 'sum') value = scores.reduce((a, b) => a + b, 0);
    else if (aggMode === 'avg') value = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    else value = scores.reduce((a, b) => betterOf(a, b, g.better));
    out.push({ dealerId: dealer.id, score: value });
  });
  return out;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function avatarColor(dealerId) { return AVATAR_TINTS[hashStr(dealerId) % AVATAR_TINTS.length]; }

const rankedEntries = computed(() => {
  if (isFreePlay.value) return [];
  if (isWeekly.value) return rankEntries(weeklyEntries(gameId.value, day.value, agg.value), game.value.better);
  return rankEntries(effectiveEntries(gameId.value, day.value), game.value.better);
});

const boardTitle = computed(() => `${game.value.name} — ${isWeekly.value ? 'Weekly' : 'Daily'}`);
const boardSub = computed(() => {
  if (isFreePlay.value) return 'Sunday · free play';
  const dateLabel = formatDay(weekDates[day.value]);
  if (isWeekly.value) {
    const aggLabel = agg.value === 'sum' ? 'sum of the week' : agg.value === 'avg' ? 'average of the week' : 'best day of the week';
    return `Through ${dateLabel} · ${aggLabel}`;
  }
  return `${dateLabel} · resets tonight`;
});

const top20 = computed(() => rankedEntries.value.slice(0, 20));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,900;1,500;1,600&family=Karla:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

/*
 * Namespaced under `lp-` and `.leaderboard-page` — see the write-up in
 * games/car-trivia/web/style.css on why generic names (`.btn`, `.modal`,
 * `.seg`, `.stat`, ...) collide with Bootstrap once embedded in
 * acv-web-vuejs.
 */
.leaderboard-page {
  --lp-ground: #d9c7a0;
  --lp-ground-2: #cdb789;
  --lp-surface: #fbf6e9;
  --lp-surface-2: #f3ecd9;
  --lp-ink: #2b2016;
  --lp-ink-dim: #6b5b44;
  --lp-accent: #c1443d;
  --lp-accent-ink: #fff6f0;
  --lp-accent-2: #2e6e62;
  --lp-accent-2-ink: #f2fbf8;
  --lp-accent-3: #b9791f;
  --lp-accent-3-ink: #fffaf0;
  --lp-card-shadow: rgba(43, 32, 22, .22);
  --lp-hairline: rgba(43, 32, 22, .16);
  --lp-focus: #2e6e62;

  min-height: inherit;
  background: radial-gradient(120% 140% at 50% -10%, var(--lp-ground-2), var(--lp-ground));
  color: var(--lp-ink);
  font-family: "Karla", ui-sans-serif, system-ui, sans-serif;
}

@media (prefers-color-scheme: dark) {
  .leaderboard-page {
    --lp-ground: #12241c;
    --lp-ground-2: #0d1c16;
    --lp-surface: #1f3129;
    --lp-surface-2: #24382f;
    --lp-ink: #ede7d8;
    --lp-ink-dim: #ab9d80;
    --lp-accent: #e2726b;
    --lp-accent-ink: #241211;
    --lp-accent-2: #6cc0ac;
    --lp-accent-2-ink: #0d2a22;
    --lp-accent-3: #e2b45a;
    --lp-accent-3-ink: #2a1e05;
    --lp-card-shadow: rgba(0, 0, 0, .45);
    --lp-hairline: rgba(237, 231, 216, .14);
    --lp-focus: #6cc0ac;
  }
}

.leaderboard-page h1, .leaderboard-page h2 {
  font-family: "Fraunces", Georgia, serif;
  margin: 0;
}

.lp-wrap { max-width: 900px; margin: 0 auto; padding: 12px 20px 40px; }

.lp-top { margin-bottom: 20px; }
.lp-title-block h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 700; font-style: italic; }
.lp-tagline { margin: 8px 0 0; max-width: 52ch; color: var(--lp-ink-dim); font-size: 14.5px; line-height: 1.5; }

.lp-config { display: flex; flex-direction: column; gap: 16px; margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px dashed var(--lp-hairline); }
.lp-config-row { display: flex; flex-wrap: wrap; gap: 20px 28px; align-items: flex-end; }
.lp-config-group { display: flex; flex-direction: column; gap: 7px; }
.lp-config-label {
  font-family: "IBM Plex Mono", monospace; font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase;
  color: var(--lp-ink-dim); display: flex; align-items: center; gap: 6px;
}

.lp-seg, .lp-day-seg { display: flex; border: 1px solid var(--lp-hairline); border-radius: 999px; overflow: hidden; background: var(--lp-surface); }
.lp-seg button, .lp-day-seg button {
  font-family: "IBM Plex Mono", monospace; font-size: 12px; border: none; background: transparent; color: var(--lp-ink-dim);
  padding: 7px 14px; cursor: pointer;
}
.lp-day-seg button { font-size: 11.5px; padding: 7px 12px; }
.lp-seg button.active { background: var(--lp-accent-2); color: var(--lp-accent-2-ink); }
.lp-day-seg button.active { background: var(--lp-accent-2); color: var(--lp-accent-2-ink); }
.lp-day-seg button.free-play { color: var(--lp-accent-3); }
.lp-day-seg button.free-play.active { background: var(--lp-accent-3); color: var(--lp-accent-3-ink); }
.lp-tbd-flag {
  background: var(--lp-accent-3); color: var(--lp-accent-3-ink); font-size: 8.5px; padding: 2px 6px;
  border-radius: 5px; letter-spacing: .05em; text-transform: uppercase; font-family: "IBM Plex Mono", monospace; font-weight: 700;
}

.lp-select {
  font-family: "Karla", sans-serif; font-size: 13px; padding: 7px 12px; border-radius: 999px;
  border: 1px solid var(--lp-hairline); background: var(--lp-surface); color: var(--lp-ink); min-width: 190px;
}

.lp-board-wrap {
  background: var(--lp-surface); border: 1px solid var(--lp-hairline); border-radius: 10px;
  box-shadow: 0 6px 14px -6px var(--lp-card-shadow); overflow: hidden;
}
.lp-board-head {
  padding: 16px 20px 13px; border-bottom: 1px dashed var(--lp-hairline); display: flex; align-items: baseline;
  justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.lp-board-head h2 { font-size: 19px; font-style: italic; font-weight: 700; }
.lp-sub { margin: 0; font-family: "IBM Plex Mono", monospace; font-size: 11.5px; color: var(--lp-ink-dim); }

.lp-list { list-style: none; margin: 0; padding: 4px 0; }
.lp-empty { padding: 38px 20px; text-align: center; color: var(--lp-ink-dim); font-size: 13.5px; line-height: 1.6; }
.lp-empty .glyph { font-size: 26px; display: block; margin-bottom: 10px; }
</style>

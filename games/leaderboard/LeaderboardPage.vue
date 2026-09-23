<template>
  <div class="leaderboard-page">
    <nav class="lp-nav">
      <a href="/game-jam">&larr; Home</a>
    </nav>

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
            <label class="lp-config-label">Dealer</label>
            <div class="lp-seg">
              <button
                type="button"
                :disabled="dealerId == null"
                :class="{ active: scope === 'mine' }"
                @click="scope = 'mine'"
              >Your dealer</button>
              <button
                type="button"
                :class="{ active: scope === 'all' }"
                @click="scope = 'all'"
              >All of ACV</button>
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
          v-if="loading"
          class="lp-empty"
        >
          Loading…
        </div>

        <div
          v-else-if="!rankedEntries.length"
          class="lp-empty"
        >
          <span class="glyph">{{ isFreePlay ? '☀' : '—' }}</span>
          {{ isFreePlay
            ? 'Sunday is free play — dealers can still play for fun, but nothing posts to the daily or weekly leaderboard today.'
            : fetchError
              ? "Couldn't load scores — try again in a moment."
              : 'No qualifying scores yet for this view.' }}
        </div>

        <ol
          v-else
          class="lp-list"
        >
          <LeaderboardRow
            v-for="entry in top20"
            :key="entry.username"
            :entry="entry"
            :game="game"
            :name="entry.username"
            :avatar-color="avatarColor(entry.username)"
          />
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import LeaderboardRow from './LeaderboardRow.vue';
import { isSupabaseConfigured, supabaseHeaders, supabaseRestUrl } from '../shared/supabaseClient';

const props = defineProps({
  dealerId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: null },
  username: { type: String, default: null },
});

// Each entry matches an actual game we've built (see the routes this remote
// exposes) rather than a made-up set — unit/better/min/max/fmt describe how
// that game's own scoring already works, and gameId is exactly the value
// each game's app.js saves to the Scores table (see saveScoreRemote calls).
const GAMES = [
  { id: 'guess-the-deal', name: 'Guess the Deal', unit: 'pts', better: 'high', fmt: 'plain' },
  { id: 'lot-jam', name: 'Lot Jam', unit: 's', better: 'low', fmt: 'time' },
  { id: 'car-trivia', name: 'Car Trivia', unit: 'pts', better: 'high', fmt: 'plain' },
  { id: 'cardle', name: 'Cardle', unit: 'guesses', better: 'low', fmt: 'plain' },
  { id: 'reveal-the-deal', name: 'Reveal the Deal', unit: 'guesses', better: 'low', fmt: 'plain' },
  { id: 'route-runner', name: 'Route Runner', unit: 's', better: 'low', fmt: 'time' },
];
const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AVATAR_TINTS = ['#8074cf', '#4f8fae', '#5a9a73', '#c06a56', '#6c7480', '#a8791b'];

// The last 7 real calendar days ending today (index 6 = today), so the day
// picker shows actual dates instead of an abstract "day 0-6" — and, unlike
// anchoring to a Sunday-start calendar week, this never shows a date that
// hasn't happened yet. All in the browser's local timezone, matched by
// dayIndexForRow below when bucketing rows fetched from Supabase.
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

function isBetterScore(a, b, better) {
  return better === 'high' ? a > b : a < b;
}

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
const scope = ref(props.dealerId != null ? 'mine' : 'all');
const day = ref(6);

const game = computed(() => GAME_BY_ID[gameId.value]);
const isWeekly = computed(() => cycle.value === 'weekly');
const isSunday = computed(() => weekDates[day.value].getDay() === 0);
const isFreePlay = computed(() => !isWeekly.value && isSunday.value);

const rawRows = ref([]);
const loading = ref(false);
const fetchError = ref(false);

// Fetches cover the whole window a view could need (through the selected
// day for weekly, just that one day for daily) in one request; per-day
// bests and weekly aggregates are then computed client-side from that flat
// row set, since PostgREST alone can't express "best score per player per
// day" as a query.
function queryRange() {
  const from = isWeekly.value ? weekDates[0] : weekDates[day.value];
  const to = new Date(weekDates[day.value].getTime() + 86400000);
  return { from, to };
}

async function fetchRows() {
  if (!isSupabaseConfigured()) {
    rawRows.value = [];
    return;
  }
  loading.value = true;
  fetchError.value = false;
  try {
    const { from, to } = queryRange();
    const params = new URLSearchParams();
    params.set('select', 'username,score,dealerId,created_at');
    params.append('gameId', `eq.${gameId.value}`);
    params.append('created_at', `gte.${from.toISOString()}`);
    params.append('created_at', `lt.${to.toISOString()}`);
    if (scope.value === 'mine' && props.dealerId != null) {
      params.append('dealerId', `eq.${props.dealerId}`);
    }
    params.append('order', 'created_at.desc');
    params.append('limit', '1000');
    const res = await fetch(`${supabaseRestUrl('Scores')}?${params.toString()}`, {
      headers: supabaseHeaders(),
    });
    if (!res.ok) throw new Error('bad response');
    rawRows.value = await res.json();
  } catch (e) {
    fetchError.value = true;
    rawRows.value = [];
  } finally {
    loading.value = false;
  }
}
watch([gameId, cycle, day, scope], fetchRows, { immediate: true });

// Which index in weekDates a fetched row's created_at (UTC) falls on, once
// converted to the viewer's local calendar day — mirrors how weekDates
// itself is built above.
function dayIndexForRow(row) {
  const d = new Date(row.created_at);
  d.setHours(0, 0, 0, 0);
  const t = d.getTime();
  return weekDates.findIndex((wd) => wd.getTime() === t);
}

// dayBests[dayIndex][username] = { score, dealerId } — each player's best
// attempt that day, collapsed from however many rows they actually played.
const dayBests = computed(() => {
  const map = {};
  rawRows.value.forEach((row) => {
    const di = dayIndexForRow(row);
    if (di === -1) return;
    if (!map[di]) map[di] = {};
    const current = map[di][row.username];
    if (!current || isBetterScore(row.score, current.score, game.value.better)) {
      map[di][row.username] = { score: row.score, dealerId: row.dealerId };
    }
  });
  return map;
});

// Standard competition ranking: ties share a rank, the next distinct score
// resumes at its true 1-based position (so a tie for 1st is followed by 3rd).
function rankEntries(entries, better) {
  const sorted = [...entries].sort((a, b) => (better === 'high' ? b.score - a.score : a.score - b.score));
  const out = [];
  let prevScore = null;
  let prevRank = 0;
  sorted.forEach((e, i) => {
    const rank = (prevScore !== null && e.score === prevScore) ? prevRank : i + 1;
    out.push({ username: e.username, score: e.score, dealerId: e.dealerId, rank });
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
function weeklyEntries(d, aggMode) {
  const days = weeklyWindow(d);
  const perUser = {};
  days.forEach((di) => {
    const dayMap = dayBests.value[di] || {};
    Object.keys(dayMap).forEach((username) => {
      if (!perUser[username]) perUser[username] = { scores: [], dealerId: dayMap[username].dealerId };
      perUser[username].scores.push(dayMap[username].score);
    });
  });
  return Object.keys(perUser).map((username) => {
    const { scores, dealerId } = perUser[username];
    let value;
    if (aggMode === 'sum') value = scores.reduce((a, b) => a + b, 0);
    else if (aggMode === 'avg') value = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    else value = scores.reduce((a, b) => (isBetterScore(b, a, game.value.better) ? b : a));
    return { username, score: value, dealerId };
  });
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function avatarColor(username) { return AVATAR_TINTS[hashStr(username) % AVATAR_TINTS.length]; }

const rankedEntries = computed(() => {
  if (isFreePlay.value) return [];
  if (isWeekly.value) return rankEntries(weeklyEntries(day.value, agg.value), game.value.better);
  const dayMap = dayBests.value[day.value] || {};
  const entries = Object.keys(dayMap).map((username) => ({ username, ...dayMap[username] }));
  return rankEntries(entries, game.value.better);
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
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

/*
 * ACV brand tokens — see the write-up in games/guess-the-deal/web/style.css.
 * The warm parchment/Fraunces theme is replaced with ACV's light theme and
 * Roboto; variable names are unchanged so every var(--lp-x) usage below
 * still resolves, only the values (and the font stack) changed. Also
 * dropped the prefers-color-scheme dark variant this page used to have,
 * same reasoning as every other game — ACV's own product doesn't
 * auto-dark-mode.
 */
.leaderboard-page {
  --lp-ground: #fafafa;
  --lp-ground-2: #f1f1f1;
  --lp-surface: #ffffff;
  --lp-surface-2: #f5f5f5;
  --lp-ink: #212121;
  --lp-ink-dim: #757575;
  --lp-accent: #ff5449;
  --lp-accent-ink: #ffffff;
  --lp-accent-2: #004e7d;
  --lp-accent-2-ink: #ffffff;
  --lp-accent-3: #ffc000;
  --lp-accent-3-ink: #212121;
  --lp-card-shadow: rgba(33, 33, 33, .15);
  --lp-hairline: rgba(33, 33, 33, .12);
  --lp-focus: #7b61ff;

  min-height: inherit;
  background: radial-gradient(120% 140% at 50% -10%, var(--lp-ground-2), var(--lp-ground));
  color: var(--lp-ink);
  font-family: "Roboto", ui-sans-serif, system-ui, sans-serif;
}

.leaderboard-page h1, .leaderboard-page h2 {
  font-family: "Roboto", Helvetica, Arial, sans-serif;
  margin: 0;
}

.lp-nav {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 8px 20px;
  padding-top: calc(8px + env(safe-area-inset-top, 0px));
  border-bottom: 1px solid var(--lp-hairline);
}
.lp-nav a {
  font-size: 12px; font-weight: 600; color: var(--lp-ink-dim); text-decoration: none;
  padding: 5px 11px; border-radius: 999px; border: 1px solid var(--lp-hairline); background: var(--lp-surface);
}
.lp-nav a:hover { color: var(--lp-ink); background: var(--lp-surface-2); }

.lp-wrap { max-width: 900px; margin: 0 auto; padding: 12px 20px 40px; }

.lp-top { margin-bottom: 20px; }
.lp-title-block h1 { font-size: clamp(28px, 4vw, 42px); font-weight: 700; }
.lp-tagline { margin: 8px 0 0; max-width: 52ch; color: var(--lp-ink-dim); font-size: 14.5px; line-height: 1.5; }

.lp-config { display: flex; flex-direction: column; gap: 16px; margin-bottom: 26px; padding-bottom: 20px; border-bottom: 1px dashed var(--lp-hairline); }
.lp-config-row { display: flex; flex-wrap: wrap; gap: 20px 28px; align-items: flex-end; }
.lp-config-group { display: flex; flex-direction: column; gap: 7px; }
.lp-config-label {
  font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; font-weight: 500;
  color: var(--lp-ink-dim); display: flex; align-items: center; gap: 6px;
}

.lp-seg, .lp-day-seg { display: flex; border: 1px solid var(--lp-hairline); border-radius: 999px; overflow: hidden; background: var(--lp-surface); }
.lp-seg button, .lp-day-seg button {
  font-size: 12px; border: none; background: transparent; color: var(--lp-ink-dim);
  padding: 7px 14px; cursor: pointer;
}
.lp-day-seg button { font-size: 11.5px; padding: 7px 12px; }
.lp-seg button.active { background: var(--lp-accent-2); color: var(--lp-accent-2-ink); }
.lp-day-seg button.active { background: var(--lp-accent-2); color: var(--lp-accent-2-ink); }
.lp-day-seg button.free-play { color: var(--lp-accent-3); }
.lp-day-seg button.free-play.active { background: var(--lp-accent-3); color: var(--lp-accent-3-ink); }
.lp-tbd-flag {
  background: var(--lp-accent-3); color: var(--lp-accent-3-ink); font-size: 8.5px; padding: 2px 6px;
  border-radius: 5px; letter-spacing: .05em; text-transform: uppercase; font-weight: 700;
}

.lp-select {
  font-family: "Roboto", sans-serif; font-size: 13px; padding: 7px 12px; border-radius: 999px;
  border: 1px solid var(--lp-hairline); background: var(--lp-surface); color: var(--lp-ink); min-width: 190px;
}

.lp-board-wrap {
  background: var(--lp-surface); border: 1px solid var(--lp-hairline); border-radius: 8px;
  box-shadow: 0 2px 8px -2px var(--lp-card-shadow); overflow: hidden;
}
.lp-board-head {
  padding: 16px 20px 13px; border-bottom: 1px dashed var(--lp-hairline); display: flex; align-items: baseline;
  justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.lp-board-head h2 { font-size: 19px; font-weight: 700; }
.lp-sub { margin: 0; font-size: 11.5px; color: var(--lp-ink-dim); }

.lp-list { list-style: none; margin: 0; padding: 4px 0; }
.lp-empty { padding: 38px 20px; text-align: center; color: var(--lp-ink-dim); font-size: 13.5px; line-height: 1.6; }
.lp-empty .glyph { font-size: 26px; display: block; margin-bottom: 10px; }
</style>

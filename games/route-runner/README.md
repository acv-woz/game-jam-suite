# Route Runner

A client-only hackathon POC: a LinkedIn Zip-style puzzle where you connect
numbered delivery stops with one continuous line that covers every tile on
a lot grid, no crossing your own path. No backend, no real dealer data —
every puzzle is procedurally generated in the browser from the calendar
date.

## Run it

Open `web/index.html` directly (double-click it, or `open web/index.html`).
Everything is generated client-side with no `fetch()` calls, so unlike the
other games in this suite it works fine straight from `file://` — a local
server is optional:

```
cd games/route-runner
python3 -m http.server 8793
```

Then open `http://localhost:8793/web/index.html`.

## How puzzle generation works

The core idea: **draw the line first, then place numbers along it — that
way the line is always valid.**

1. `web/generator.js` runs a randomized, Warnsdorff-heuristic backtracking
   search for a Hamiltonian path: a route that visits every cell on the
   grid exactly once. This is the actual solution line.
2. It then stamps numbered stops onto cells along that line (always
   including the first and last cell), spaced with a little randomness but
   never closer than 2 cells apart.
3. Because the numbers are just labels on an already-complete route, every
   generated puzzle is solvable by construction — there's no separate
   "does this puzzle have an answer" validation step to get wrong, unlike
   Lot Jam's BFS solver which has to check solvability *after* a layout is
   hand-authored.

The whole thing is seeded from the date string (`YYYY-MM-DD`, UTC) via a
tiny FNV-1a hash + mulberry32 PRNG, so every player gets the same puzzle on
the same day with zero server involvement — a new, valid route every day,
forever, with no ongoing curation needed.

Grid size is 5x5 on most days; Wednesdays and Saturdays are 6x6 challenge
days (`sizeForDate()` in `generator.js`).

### The parity trick

An odd grid (5x5 = 25 cells) can't start a full-coverage path from just any
cell. Color the grid like a checkerboard by `(row+col) % 2`: a path
alternates colors every step, so a path visiting an odd number of cells
must start *and* end on the majority color (13 cells vs. 12 for a 5x5) —
starting on the minority color makes full coverage impossible by a simple
counting argument, not just hard to find. The generator only ever picks a
start cell that this check allows, which is why it converges quickly
instead of retrying blindly.

## What's implemented

- Procedural daily puzzle generator (`web/generator.js`), shared verbatim
  between the browser and a small Node CLI (`tools/generate-puzzles.js`).
  Run it with no arguments for usage. `node tools/generate-puzzles.js <N>`
  bulk-verifies the next N days all generate cleanly; `node
  tools/generate-puzzles.js <date>` prints one day's puzzle as JSON.
- Flow-Free-style drag-to-draw interaction: drag from stop 1, extend along
  orthogonal neighbors, drag backward to retract, numbers must be hit in
  ascending order, route must finish exactly on the highest-numbered stop.
- Daily rotation keyed by UTC date (Wordle-style numbering against an
  arbitrary epoch), with a 7-day practice strip.
- **Each date can only be solved once, ever** (per browser). The result is
  written to `localStorage` on first completion and never overwritten;
  revisiting an already-solved date (today's or a past practice day) loads
  it locked read-only — board interaction and Undo/Reset are disabled, and
  the stat bar + note show the recorded result instead of a fresh puzzle.
  This applies uniformly to today's puzzle and to practice days.
- Two bonus flags recorded alongside the time, for a future leaderboard to
  break ties between equal times: **clean route** (no retraces — never
  dragged backward over your own trail, clicked back onto an earlier tile,
  or hit Undo) and **one continuous drag** (never lifted the pointer/finger
  between the first press on stop 1 and the winning move). Tracked in
  `app.js` via `hadRetrace` and `pointerDownCount`, reset on every `Reset`
  click or fresh puzzle load, and frozen into the result record the moment
  a route is solved.
- Undo, Reset, timer, win modal (shows time, stop count, and which bonuses
  were earned), and a spoiler-free "Copy result" share string (time +
  bonuses + stop/tile counts, no solution revealed).

## Not in this POC

- No walls/obstacles, so a puzzle's solution isn't guaranteed unique — any
  route that hits the numbers in order and covers every tile counts as a
  win, even if it differs from the generator's own solution line. Adding
  wall segments (like the real Zip) to force a single correct route would
  be a good follow-up.
- No actual leaderboard/highscore list yet — `noRetrace` and `noLift` are
  captured now specifically so that when one lands, it can rank equal
  times by these as tiebreakers (clean + one-touch > clean > messy) without
  a data migration.
- No real per-day streak tracking across sessions/devices, and no
  shared/multiplayer leaderboard (both need a backend). The "solved once"
  lock is also only per-browser via `localStorage` — clearing site data or
  switching browsers resets it, and there's no server-side enforcement
  stopping someone from doing that to re-solve a date.
- No difficulty-rank tiers on the win screen (unlike Lot Jam's par-based
  ranks) — there's no natural "par" for a puzzle that always takes exactly
  `size*size - 1` moves to solve, so the win screen shows time + bonuses
  instead.

## Puzzle format

`generatePuzzle(dateStr, sizeOverride)` returns:

```js
{
  seed: "2026-09-22",
  size: 5,
  checkpoints: [{ number: 1, row: 1, col: 3 }, /* ... */],
  solution: [[1, 3], [0, 3], /* one [row, col] per cell, in visit order */]
}
```

`solution` is the generator's own Hamiltonian path — useful for a future
hint system, but the game itself never checks a player's route against it
directly; it only enforces the ascending-order-and-full-coverage rules
above.

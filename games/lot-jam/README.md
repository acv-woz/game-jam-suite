# Lot Jam

A client-only hackathon POC: a Rush Hour-style sliding-block puzzle where
you shuffle parked cars around a jammed lot to clear a path for one car
to exit. No backend, no real dealer data — everything is a hand-authored
puzzle layout.

## Run it

```
cd games/lot-jam
python3 -m http.server 8792
```

Then open `http://localhost:8792/web/index.html`.

(`web/app.js` fetches `data/puzzles.json` over http; if you instead
double-click `web/index.html` directly, most browsers block that fetch
under `file://`, so the app falls back to an embedded copy of the same
data baked into `app.js`. Edit `data/puzzles.json` to change puzzles
when running via a server; keep the `FALLBACK_PUZZLES` copy in
`app.js` in sync if you want `file://` mode to match.)

## What's implemented

- 7 hand-designed daily puzzles (Monday Warmup through Gridlock, plus a
  lighter Sunday reset), each verified solvable with a true minimum
  move count (`par`) via a small BFS solver — see `data/puzzles.json`
- Daily rotation: everyone sees the same puzzle on the same day
  (Wordle-style numbering), with a day-strip to freely practice any of
  the 7 without affecting your streak
- Pointer-based drag-to-slide interaction with axis-locked, collision-
  aware clamping (mouse + touch via Pointer Events)
- Move counter, timer, Undo, Reset
- Win modal: moves vs. par, time, a qualitative rank (Flawless Parking
  Job → Total Gridlock), and a "Copy result" spoiler-free share string
- Local best-score-per-puzzle via `localStorage` (per-browser, not shared)

## Not in this POC

- Real per-day streak tracking across sessions/devices (needs a backend)
- Shared/multiplayer leaderboard
- More than 7 puzzles (add more to `data/puzzles.json` — validate them
  with a BFS solver first; a puzzle that "looks solvable" by eye can
  easily be off by one blocked cell)

## Puzzle format

Each puzzle in `data/puzzles.json` is a 6x6 grid: vehicles are either
`H` (horizontal, slides left/right) or `V` (vertical, slides up/down),
with a `len` of 2 or 3 cells. Exactly one vehicle has `isTarget: true`
and must always be horizontal, starting at `row: 2`; the win condition
is that vehicle's front reaching the right wall (col + len - 1 === 5).
`par` is the true minimum move count found by BFS, not a guess — don't
hand-edit a puzzle's vehicle list without re-verifying `par`.

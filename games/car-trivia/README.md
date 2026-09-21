# Car Trivia

A client-only hackathon POC: a Jeopardy-styled daily trivia round. Five
multiple-choice questions — one each from Supercars & Speed, Logos &
Branding, Pop Culture & Movies, and Firsts & History, plus a wildcard —
pulled the same way for everyone on a given day. No backend; everything
is a hand-authored question pool.

## Run it

```
cd games/car-trivia
python3 -m http.server 8793
```

Then open `http://localhost:8793/web/index.html`.

(`web/app.js` fetches `data/questions.json` over http; if you instead
double-click `web/index.html` directly, most browsers block that fetch
under `file://`, so the app falls back to an embedded copy of the same
data baked into `app.js`. Edit `data/questions.json` to change/add
questions when running via a server; keep the `FALLBACK_QUESTIONS` copy
in `app.js` in sync if you want `file://` mode to match.)

## What's implemented

- A 40-question pool (10 per theme) in `data/questions.json`
- Daily selection: one question per theme plus a wildcard fifth,
  deterministically picked from the day's date (Wordle-style — everyone
  gets the same 5 questions, in the same order, with the same shuffled
  answer positions, on a given day) via a seeded PRNG, not real
  per-player randomness
- Click an answer, submit, get an immediate flashy correct/wrong
  banner plus the correct answer highlighted on the tile, then move to
  the next question
- Scoring: 1 point per correct answer (5 max); a running timer that
  keeps going until the 5th question is answered, used purely as a
  tiebreaker (faster time wins on equal score)
- Local leaderboard via `localStorage`, sorted by score then time

## Not in this POC

- Real per-day streak tracking or a shared/multiplayer leaderboard
  (both would need a backend)
- More than 40 questions (add more to `data/questions.json` — keep
  `theme` one of the 4 existing slugs, or update `THEME_LABELS`/
  `THEME_ORDER` in `app.js` if you add a new one)

## Question format

Each entry in `data/questions.json` has an `id`, a `theme` slug (one of
`supercars-speed`, `logos-branding`, `pop-culture-movies`,
`firsts-history`), a `question` string, an `options` array of exactly
4 strings, and a `correctIndex` (0-3) into that array. `app.js` shuffles
option order per day before displaying — `correctIndex` in the data
file always refers to the *unshuffled* authored order.

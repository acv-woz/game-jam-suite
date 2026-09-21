# Cardle

A client-only hackathon POC: a daily "guess the vehicle" game, closer to
Loldle/Pokedle than literal Wordle — you don't get letter-by-letter
feedback, you get per-attribute feedback (Make, Model, Year, Body,
Drivetrain, Origin) on each guess. No backend, no real dealer data —
the vehicle pool is a hand-authored list of well-known production
vehicles, procedurally picked per day.

## Run it

```
cd games/cardle
python3 -m http.server 8791
```

Then open `http://localhost:8791/web/index.html`.

(`web/app.js` fetches `data/vehicles.json` over http; if you instead
double-click `web/index.html` directly, most browsers block that fetch
under `file://`, so the app falls back to an embedded copy of the same
data baked into `app.js`. Edit `data/vehicles.json` to change the pool
when running via a server, and keep the `FALLBACK_VEHICLES` copy in
`app.js` in sync — a quick `JSON.stringify` diff of the two catches any
drift.)

## What's implemented

- 58 real, well-known vehicles (`data/vehicles.json`) as both the
  answer pool and the only valid guesses — a couple of nameplates
  (Honda Civic) appear at two different model years on purpose, so the
  Year column's direction arrow actually matters sometimes.
- Daily target picked deterministically from the date string (same
  seeded-PRNG approach as Route Runner's generator — FNV-1a hash +
  mulberry32), so everyone gets the same car on the same day with zero
  server involvement, plus a 7-day practice strip.
- Typeahead guess input (custom, not a native `<datalist>`) — you can
  only submit a real vehicle from the pool, matching every other
  Wordle-style game's "must be a real word" constraint.
- Per-guess feedback grid: green when an attribute matches, gray when
  it doesn't, plus a ▲/▼ arrow on the Year column pointing toward the
  answer when you're off. Win condition is the exact Make+Model+Year
  triple, not "every column happens to be green."
- 6 guesses, per-day state persisted via `localStorage` (reload mid-game
  or revisit a finished day and it's exactly as you left it — matches
  real Wordle's behavior), a win/loss streak counter (today's puzzle
  only; practice days don't touch it), and a spoiler-light "Copy
  result" grid of ✓/✗ symbols (no vehicle names, just which columns hit).

## Not in this POC

- No hint ladder / progressive reveal (the original pitch mentioned
  "maybe use image of car" — real per-model photos aren't practical to
  source/host for 58 vehicles here, and the suite avoids external image
  hosts by convention; a CSS-drawn generic silhouette that unlocks a new
  detail per guess would be a reasonable follow-up).
- No shared/multiplayer leaderboard (needs a backend) — the streak
  counter is local to the browser, same caveat as every other game in
  the suite.
- Tier (Economy/Mainstream/Premium/Luxury) is in the data but not shown
  as a guess column — it's a soft, debatable classification rather than
  a fact, unlike the other five columns; wire it in if that changes.

## Data format

Each entry in `data/vehicles.json` is `{ make, model, year, body, drive,
origin, tier }`. `body`/`drive`/`origin` are free-text strings compared
by exact match, so keep spelling/casing consistent across entries (e.g.
always `"SUV"`, never `"suv"` or `"Suv"`) or two equivalent values won't
register as a match.

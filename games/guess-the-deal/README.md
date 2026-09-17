# Guess the Deal

A client-only hackathon POC: 12 rounds of "what did this sell for?" /
"what's the mileage?" using hand-written sample vehicle data — no backend,
no real dealer/sales connections. See `PLAN.md` for the original full
architecture (real data ingest, auth, admin API) that this POC intentionally
skips for now.

## Run it

```
cd dealer-price-guess-game
python3 -m http.server 8791
```

Then open `http://localhost:8791/web/index.html`.

(`web/app.js` fetches `data/seed-rounds.json` over http; if you instead
double-click `web/index.html` directly, most browsers block that fetch
under `file://`, so the app falls back to an embedded copy of the same
data baked into `app.js`. Edit `data/seed-rounds.json` to change rounds
when running via a server; keep the `FALLBACK_ROUNDS` copy in `app.js` in
sync if you want file:// mode to match.)

## What's implemented

- 12-round game pulled from `data/seed-rounds.json` (14 sample vehicles,
  shuffled and truncated to 12 each game)
- Alternating "guess the price" / "guess the mileage" rounds
- Slider + numeric input, synced both ways
- Exponential scoring curve (closer guess = more points, up to 1,000/round)
- Streak bonus after 3 qualifying guesses in a row
- Animated reveal (guess vs. actual, comparison bar, points count-up)
- End-of-game rank (Rookie → Master Appraiser) based on total score
- Local leaderboard via `localStorage` (per-browser, not shared)

## Not in this POC (see PLAN.md)

- Real closed-auction data / ingest job
- Dealer SSO auth
- Shared/multiplayer leaderboard (would need a real backend + DB)
- Admin endpoints

## Next polish ideas

- Replace the placeholder SVG car with a small per-body-style icon set
  (sedan/SUV/truck silhouettes)
- Add sound/haptic feedback on reveal
- Difficulty modes (tighter scoring curve for "Expert")

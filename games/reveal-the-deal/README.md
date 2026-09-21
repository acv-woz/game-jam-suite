# Reveal the Deal

A client-only hackathon POC: a Heardle-style tile-reveal game. Every
guess flips a few more tiles off a sold listing's photo, whether the
guess was right or not; name the make, model and year before the
picture's fully uncovered. Pitched on the
[Game Jam Board](https://claude.ai/artifact/2zow4XXrz3z93xAvcRYF4q)
as a follow-up to a "guess the car from a picture" idea, tying it to
Guess the Deal's real-listing framing instead of stock photos of named
production models (see `web/images/README.md` for why that
distinction matters).

## Run it

```
cd games/reveal-the-deal
python3 -m http.server 8792
```

Then open `http://localhost:8792/web/index.html`.

(`web/app.js` fetches `data/rounds.json` and `data/vehicles.json` over
http; opening `web/index.html` directly falls back to an embedded copy
of both baked into `app.js`, same pattern as Lot Jam/Cardle. Keep the
fallback objects in sync if you edit either JSON file while running
via a server.)

## What's implemented

- 7 fixed rounds (`data/rounds.json`, Monday through Sunday, same
  weekly-rotation convention as Lot Jam — `daysSinceEpoch() % 7`
  picks today's, and you can freely practice any other day from the
  strip without it counting against your best). Each round is a
  target vehicle plus a one-line flavor hint (body style + region,
  same idea as Guess the Deal's condition notes) and an image.
- A 5×4 tile grid over that image. Guessing reveals more of it — the
  reveal order is shuffled but deterministic per round (seeded off the
  round's own id), and the count revealed scales evenly across the 6
  allowed guesses (`revealCountFor()` in `app.js`), landing on the
  full picture exactly at guess 6 if you haven't solved it by then.
  Winning reveals everything immediately.
- Typeahead guess input against a 33-vehicle pool (`data/vehicles.json`)
  — same "must be a real, known vehicle" constraint as Cardle, and for
  the same reason: guessing against an unknowable pool isn't a fair
  puzzle, it's a memory test.
- Best score per round (fewest guesses) via `localStorage`, unlimited
  replays — matches Lot Jam's convention, not Cardle's once-a-day one,
  since this is architecturally a fixed-rotation game like Lot Jam
  rather than a date-seeded daily one.
- A placeholder image (a generic car glyph, hue varied per round) for
  any round whose real photo isn't in `web/images/` yet — the tile
  mechanic works identically either way, so the game is fully playable
  before a single real photo exists. See `web/images/README.md`.

## Not in this POC

- No real closed-auction photos yet — Guess the Deal itself is 100%
  hand-written mock JSON today with no image pipeline at all, so
  "reuse the existing photo pipeline" (what the board pitch says) is
  aspirational, not already true. `web/images/README.md` has the
  masking-rules pointer for whenever that changes.
- No shared/multiplayer leaderboard (needs a backend); best score is
  local to the browser, same caveat as every other game here.
- Score is guesses-used only. Tiles-revealed-at-solve is tracked and
  shown but isn't a tiebreaker — with only 6 guesses and revealed count
  determined solely by guess count, it can't actually differ between
  two people who solved in the same number of guesses, so there was
  nothing to break a tie with.

## Data format

`data/rounds.json`: `{ tileCols, tileRows, maxGuesses, rounds: [{ id,
label, flavor, vehicle: { make, model, year, trim, color }, image }] }`.
`data/vehicles.json`: `{ vehicles: [{ make, model, year }] }` — the
guess pool; every round's `vehicle` must have a matching entry here or
it's unguessable (there's no code check for this, so verify it by eye
if you add a round).

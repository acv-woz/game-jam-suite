# Game Jam Suite

A suite of small daily games for ACV's site — hackathon build, Team B
(mjw, Vikram, Conner).

## Games

- `games/guess-the-deal` — "Guess the Deal": price/mileage guessing game
  against closed-auction vehicles. Client-only POC; see its own README
  to run it.
- `games/lot-jam` — "Lot Jam": Rush Hour-style sliding car puzzle, clear
  a path out of a jammed lot. Client-only POC; see its own README to
  run it.
- `games/route-runner` — "Route Runner": LinkedIn Zip-style puzzle,
  connect numbered delivery stops with one line covering every tile.
  Client-only POC with a procedural daily generator; see its own README
  to run it.

More games move in here as their own `games/<slug>` directory once
someone starts building them.

## Play the whole suite

`games/home/web` is a standalone hub page — a tile per game, linking
straight into each one. Run one server at the repo root and open the hub
from it so every tile's link actually resolves:

```
python3 -m http.server 8790
```

Then open `http://localhost:8790/games/home/web/`. See
`games/home/README.md` — that folder also holds the *separate* production
home screen for the `acv-web-vuejs` embed, which is a different thing.

## Where new game ideas come from

Ideas get pitched and voted on the shared, live
[Game Jam Board](https://claude.ai/artifact/2zow4XXrz3z93xAvcRYF4q)
(org-internal — sign in with your ACV account; click a card to see its
full spec if it has one). `board/` holds a version-controlled snapshot
of that page's source — see `board/README.md` before editing it.
Promote an idea from the board into `games/<slug>` when you start
building it.

## Data approach

No live service-to-service integration into `acv-api`. When a game
wants real auction figures instead of hand-written mock data, someone
with existing read access pulls a one-time batch export, strips VIN /
dealer id / buyer id / exact timestamps per the masking rules in
`games/guess-the-deal/docs/data-source.md`, and commits the result as
static seed data (`games/<slug>/data/*.json`) — same shape as today's
mock `seed-rounds.json`. This skips the new-service-credential /
ingest-job ask entirely.

It does **not** skip ACV's data classification rules — closed-auction
bid data is Class 3 (Confidential). Read
`games/guess-the-deal/docs/data-source.md` before pulling anything
real, and confirm with Vikram before a real export lands in this repo.

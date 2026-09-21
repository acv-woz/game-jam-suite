# Tile images

Drop one image per game here, named `<slug>.png` — the same `slug` used
in the `GAMES` array in `../app.js`:

- `guess-the-deal.png`
- `lot-jam.png`
- `route-runner.png`

Suggested size: roughly 800×450 (16:9 — matches the tile's
`aspect-ratio`) so it fills the thumb without letterboxing; it's
`object-fit: cover`, so a different ratio just gets center-cropped
rather than squished.

Nothing else needs to change — the hub already points at
`images/<slug>.png` for every game and falls back to a plain
accent-colored initial if the file isn't there yet or fails to load.

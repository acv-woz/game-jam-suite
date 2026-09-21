# Round photos

Drop one photo per round here, named to match `data/rounds.json`'s
`image` field:

- `r1.jpg` — 2019 Honda CR-V
- `r2.jpg` — 2021 Ford F-150
- `r3.jpg` — 2020 Toyota Camry
- `r4.jpg` — 2022 Jeep Wrangler
- `r5.jpg` — 2018 Chevrolet Silverado
- `r6.jpg` — 2021 Subaru Outback
- `r7.jpg` — 2023 Tesla Model 3

Same fallback pattern as `games/home/web/images/`: until a file's
here (or if it fails to load), that round shows a generic placeholder
car glyph instead — see `placeholderDataUri()` in `../app.js`. Nothing
else needs to change; the tile-reveal mechanic works identically over
either one.

Suggested size: roughly 800×640 (5:4, matches the tile grid) so it
fills the frame without letterboxing; it's `object-fit: cover`, so a
different ratio just gets center-cropped.

**Before a real closed-auction photo goes here**, read
`../../guess-the-deal/docs/data-source.md` — the masking rules there
(strip VIN, dealer/buyer identity, exact timestamps, etc.) apply to
images too, not just the text fields Guess the Deal currently uses.
Confirm with Vikram before anything sourced from a real auction lands
in this repo, same rule as every other real-data question in this
suite.

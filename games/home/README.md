# Game Jam Home

Same POC pattern as every other game: `web/{index.html,style.css,app.js}`
is the real, standalone implementation — a grid of tiles, one per game,
each linking to that game's own page. `GameJamHome.vue` is a thin wrapper
around those same three files (via `useEmbeddedGame('home')`), exposed as
`gameJam/GameJamHome` for Module Federation into `acv-web-vuejs` (see
`filesToImportIntoAcvWebVue/README.md`). There's no separate Vue-rendered
tile grid to keep in sync — both modes run the exact same `app.js`.

`app.js` picks each tile's link based on whether it's running standalone or
embedded (`window.__GAME_JAM_DATA_BASE__` is only set when embedded, by
`useEmbeddedGame.js`): standalone uses the relative path to that game's own
`web/index.html`; embedded links to the host's `/game-jam/<slug>` route
instead. The Leaderboard entry is `embeddedOnly: true` — it only exists as
a federated Vue component with no standalone page of its own, so it's
hidden entirely outside the host.

## Run the hub

```
cd games/home/web
python3 -m http.server 8790
```

Then open `http://localhost:8790`. The tile links are relative
(`../../<slug>/web/index.html`), so they only resolve correctly when this
page is opened from inside `games/home/web/` — either via that server, or
by double-clicking `index.html` directly (works fine over `file://` too,
since it's just page navigation, not a fetch).

To serve the *whole* suite (hub + every game) from one server instead —
useful so every tile's link actually loads instead of just resolving the
right-looking URL — run a server at the repo root and open
`/games/home/web/` from it:

```
cd ../../..   # repo root
python3 -m http.server 8790
```

Then open `http://localhost:8790/games/home/web/`.

## Adding a game to the hub

Add one entry to the `GAMES` array in `web/app.js` (slug, title, tagline,
accent color, relative path to that game's `web/index.html`). Nothing
else on the page needs to change — `GameJamHome.vue` picks it up
automatically since it just wraps the same `app.js`.

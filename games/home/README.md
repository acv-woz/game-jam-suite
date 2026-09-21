# Game Jam Home

Two different "home page" things live in this folder — don't mix them up:

- **`web/`** — a standalone, client-only hub page: a grid of tiles, one per
  game, that links straight to each game's own `web/index.html`. This is
  for playing the suite locally / sharing a build, same POC pattern as
  every other `games/<slug>/web`.
- **`GameJamHome.vue` / `GameTile.vue`** — the production home screen for
  the Module Federation export into `acv-web-vuejs` (see
  `filesToImportIntoAcvWebVue/README.md`). Different routing (`/game-jam/*`
  inside the host app), different styling (Bootstrap-safe namespacing),
  not runnable standalone. Update this when a game is ready to ship inside
  the real site.

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
else on the page needs to change.

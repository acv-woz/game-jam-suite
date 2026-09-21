# filesToImportIntoAcvWebVue

`game-jam-suite` is a hackathon project. `acv-web-vuejs` is the live production
site (a separate repo). The two are connected only through Module Federation:
`acv-web-vuejs` is the **host**, this repo is a **remote** it loads games from
at runtime (see `acv-web-vuejs`'s `CLAUDE.md`, "Module Federation (MFEs)").

Most game-jam work (game logic, styling, new games, the shared back button)
lives entirely in this repo and never touches the host. But a few things —
wiring up a new game's route, registering the remote URL, adding the game-jam
home page — require small, specific changes on the `acv-web-vuejs` side too.
This folder is a mirror of every one of those host-side changes, kept here so
an agent working only in `acv-web-vuejs` (with no memory of this repo or the
conversations that produced these changes) can find and apply them correctly.

## If you're an agent working in `acv-web-vuejs`

1. Read this whole file first.
2. For each entry in the manifest below, open the corresponding file under
   this folder and apply it to `acv-web-vuejs` as described in
   [Entry format](#entry-format).
3. Line numbers in "insert at line N" comments are **approximate anchors**,
   not guarantees — they were correct as of when the snippet was captured,
   but the destination file may have changed since. Before inserting,
   confirm the anchor still makes sense (read a few lines of surrounding
   context in the live file); if it's drifted, use the surrounding code
   shown in the snippet's neighboring context to find the right spot instead
   of trusting the number blindly.
4. Skip anything that's already present in the destination file — these
   snippets are meant to be applied once. If you're not sure whether a
   change already landed, check for it (e.g. grep the route name, the env
   var, the federation key) before inserting a duplicate.
5. After applying everything, run `npm run lint` in `acv-web-vuejs` — a
   missing import or a bad insertion point is usually caught immediately.

## Entry format

Every path under this folder mirrors its destination path in `acv-web-vuejs`,
relative to that repo's root. There are two kinds of entries:

- **New files** — the file's content here is the *complete* file. Create it
  verbatim at the mirrored path in `acv-web-vuejs`. No line-number comment.
- **Modifications to an existing host file** — the file starts with a comment
  giving an approximate insertion point (`// insert at line N.` for JS,
  `<!-- insert at line N. -->` for Vue/HTML), followed by the exact snippet
  to insert there. These are **fragments, not full files** — never overwrite
  the destination file with one of these; insert the snippet into it.

## Manifest

| Path here | Destination in `acv-web-vuejs` | Kind | What it does |
|---|---|---|---|
| `.env` | `.env` | modification | Adds `VITE_GAME_JAM_REMOTE_URI`, the base URL the host resolves the `gameJam` remote from (`localhost:4444` in dev). |
| `src/constants/federationRemotes.js` | `src/constants/federationRemotes.js` | modification | Adds the `gameJam` entry to `buildRemoteUrls()`, pointing at `${VITE_GAME_JAM_REMOTE_URI}/assets/game-jam-remote-entry.js`. |
| `src/constants/routes/index.js` | `src/constants/routes/index.js` | modification | Adds the `/game-jam`, `/game-jam/guess-the-deal`, `/game-jam/lot-jam`, `/game-jam/car-trivia`, `/game-jam/cardle`, `/game-jam/reveal-the-deal`, `/game-jam/route-runner`, and `/game-jam/leaderboard` routes. |
| `src/views/GameJam/GameJamHomePage.vue` | `src/views/GameJam/GameJamHomePage.vue` | new file | Thin wrapper that federated-imports `gameJam/GameJamHome` (the tile grid of all games — see `games/home/` in this repo). |
| `src/views/GameJam/GuessTheDealPage.vue` | `src/views/GameJam/GuessTheDealPage.vue` | new file | Thin wrapper that federated-imports `gameJam/GuessTheDealApp`. |
| `src/views/GameJam/LotJamPage.vue` | `src/views/GameJam/LotJamPage.vue` | new file | Thin wrapper that federated-imports `gameJam/LotJamApp`. |
| `src/views/GameJam/CarTriviaPage.vue` | `src/views/GameJam/CarTriviaPage.vue` | new file | Thin wrapper that federated-imports `gameJam/CarTriviaApp`. |
| `src/views/GameJam/CardlePage.vue` | `src/views/GameJam/CardlePage.vue` | new file | Thin wrapper that federated-imports `gameJam/CardleApp`. |
| `src/views/GameJam/RevealTheDealPage.vue` | `src/views/GameJam/RevealTheDealPage.vue` | new file | Thin wrapper that federated-imports `gameJam/RevealTheDealApp`. |
| `src/views/GameJam/RouteRunnerPage.vue` | `src/views/GameJam/RouteRunnerPage.vue` | new file | Thin wrapper that federated-imports `gameJam/RouteRunnerApp`. |
| `src/views/GameJam/LeaderboardPage.vue` | `src/views/GameJam/LeaderboardPage.vue` | new file | Thin wrapper that federated-imports `gameJam/LeaderboardPage`. |

Every "page" wrapper follows the same pattern: a tiny `<script setup>` that
`defineAsyncComponent`s a federated import, wrapped in a `div.game-jam-page`
that (for games with their own theme) sets a matching page background so the
host's own `#app` background doesn't show through — see this repo's own
`games/*/web/style.css` for the corresponding `:root` variables each page
background references.

## Keeping this folder current

**Whenever a change to `game-jam-suite` requires a corresponding change in
`acv-web-vuejs`, mirror it into this folder in the same turn, in this same
format** — a new-file entry for new host files, or a `// insert at line N.` /
`<!-- insert at line N. -->` fragment for edits to existing host files — and
add a row to the manifest above describing it. Do this immediately, not as a
follow-up: the host-side edit and the mirror should land together so this
folder never drifts out of sync with what the live `acv-web-vuejs` checkout
actually needs.

Changes that stay entirely inside `game-jam-suite` (new games, game logic,
styling fixes, the shared `GameJamBackButton`, anything under `games/`) don't
need an entry here — only things that require editing an `acv-web-vuejs` file
do.

import { onMounted, onBeforeUnmount } from 'vue';
import { isSupabaseConfigured, supabaseHeaders, supabaseRestUrl } from './supabaseClient';

/*
 * Mounts one of the standalone games (games/<slug>/web/app.js + style.css)
 * into whatever Vue component calls this, by injecting the exact same
 * classic <script>/<link> tags the game's own web/index.html uses. The
 * game's app.js is untouched otherwise, so `python3 -m http.server` in
 * games/<slug>/ still works exactly as documented in its own README.
 *
 * app.js reads window.__GAME_JAM_DATA_BASE__ to fetch its data/*.json over
 * the correct origin when embedded (its own relative fetch path resolves
 * against the *host* page's URL, not this remote's, once injected there).
 *
 * `extraScripts` (e.g. Route Runner's `generator.js`) are loaded, in order,
 * before app.js — each one is awaited via its `onload` event rather than
 * just appended, since dynamically inserted <script> tags don't otherwise
 * guarantee execution order relative to each other.
 */
export default function useEmbeddedGame(gameSlug, { extraScripts = [], dealerId = null, userId = null, username = null } = {}) {
  // Every URL built from this (here and via window.__GAME_JAM_DATA_BASE__ in
  // each game's app.js) does `${remoteBase}/${path}` — a trailing slash on
  // the env var turns that into a double slash, which some static hosts
  // (e.g. Vercel) don't collapse and will 404 on. Stripped here, once, at
  // the single source, so every downstream consumer is protected regardless
  // of how the env var happens to be formatted.
  const remoteBase = (import.meta.env.VITE_GAME_JAM_REMOTE_URI ?? '').replace(/\/+$/, '');
  let scriptEls = [];

  // dealerId/userId come from the host page's logged-in user (see each
  // GameJam*Page.vue in acv-web-vuejs) — null until that wiring lands.
  // username is also host-supplied but falls back to whatever the player
  // last typed into a save-score form (see rememberUsername in each game's
  // app.js), so the field can still prefill in standalone/no-host mode.
  window.__GAME_JAM_USER__ = { dealerId, userId, username };

  // Every game's app.js calls this (guarded by `if
  // (window.__GAME_JAM_SAVE_SCORE__)`, since it's undefined in standalone
  // mode) once a round/game finishes, to post the result straight to
  // Supabase's PostgREST API for the Scores table. No-ops silently if the
  // Supabase env vars aren't configured or the request fails — score saving
  // is a nice-to-have, never something that should break the game.
  window.__GAME_JAM_SAVE_SCORE__ = function saveScore({ gameId, score, attemptLength, username: enteredUsername }) {
    if (!isSupabaseConfigured()) return Promise.resolve();
    const user = window.__GAME_JAM_USER__ || {};
    return fetch(supabaseRestUrl('Scores'), {
      method: 'POST',
      headers: supabaseHeaders({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify({
        username: enteredUsername || user.username || 'Anonymous',
        gameId,
        dealerId: user.dealerId ?? null,
        userId: user.userId ?? null,
        score,
        attemptLength,
      }),
    }).catch(() => {});
  };

  const injectStylesheet = () => {
    const linkId = `game-jam-${gameSlug}-styles`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `${remoteBase}/${gameSlug}/web/style.css`;
    document.head.appendChild(link);
  };

  const loadScript = (filename) => new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script');
    scriptEl.src = `${remoteBase}/${gameSlug}/web/${filename}`;
    scriptEl.onload = () => resolve(scriptEl);
    scriptEl.onerror = reject;
    scriptEls.push(scriptEl);
    document.body.appendChild(scriptEl);
  });

  onMounted(async () => {
    injectStylesheet();
    window.__GAME_JAM_DATA_BASE__ = remoteBase;
    try {
      for (const filename of [...extraScripts, 'app.js']) {
        // eslint-disable-next-line no-await-in-loop -- must load in order
        await loadScript(filename);
      }
    } catch (e) {
      /* a script failed to load — nothing more we can do here */
    }
  });

  onBeforeUnmount(() => {
    scriptEls.forEach((el) => el.remove());
    scriptEls = [];
  });
}

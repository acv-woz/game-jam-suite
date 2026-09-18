import { onMounted, onBeforeUnmount } from 'vue';

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
 */
export default function useEmbeddedGame(gameSlug) {
  const remoteBase = import.meta.env.VITE_GAME_JAM_REMOTE_URI ?? '';
  let scriptEl = null;

  const injectStylesheet = () => {
    const linkId = `game-jam-${gameSlug}-styles`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `${remoteBase}/${gameSlug}/web/style.css`;
    document.head.appendChild(link);
  };

  onMounted(() => {
    injectStylesheet();
    window.__GAME_JAM_DATA_BASE__ = remoteBase;
    scriptEl = document.createElement('script');
    scriptEl.src = `${remoteBase}/${gameSlug}/web/app.js`;
    document.body.appendChild(scriptEl);
  });

  onBeforeUnmount(() => {
    scriptEl?.remove();
  });
}

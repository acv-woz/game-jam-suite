<template>
  <a
    class="game-jam-back"
    href="/game-jam"
  >
    <svg
      class="game-jam-back__icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span>All games</span>
  </a>
</template>

<script setup>
/*
 * Shared across every game's MFE wrapper (GuessTheDealApp.vue, LotJamApp.vue,
 * ...) so "back to the game jam home" looks and behaves the same everywhere.
 * A plain `<a href="/game-jam">` rather than a router-link: vue-router isn't
 * a shared module between this remote and the host (see vite.config.js), so
 * this can't assume a router instance exists — same reasoning GameTile.vue
 * uses for its own links.
 *
 * Deliberately NOT a fixed/floating overlay: each game's own header already
 * occupies the top-left corner (brand mark, title), so this renders as its
 * own slim bar ABOVE a game's markup instead of overlapping it. Uses its own
 * self-contained colors rather than either game's CSS variables, since it's
 * meant to look identical regardless of which game's (light or dark) theme
 * it's placed above.
 */
</script>

<style scoped>
.game-jam-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin: 10px;
  padding: 7px 14px 7px 10px;
  border-radius: 999px;
  background: rgba(17, 20, 28, 0.72);
  color: #f1efe6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.12s ease;
}

.game-jam-back:hover {
  background: rgba(17, 20, 28, 0.9);
}

.game-jam-back__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>

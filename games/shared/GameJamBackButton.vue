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
    <span>Home</span>
  </a>
</template>

<script setup>
/*
 * Used by LeaderboardPage.vue for its own "back to the game jam home" link.
 * The 6 games each render their own Home + Leaderboard nav pair from their
 * own app.js instead (see games/guess-the-deal/web/app.js's renderGameNav
 * for the pattern) — this component isn't shared by them anymore, since
 * that nav needs to work identically in standalone mode too, where there's
 * no Vue component at all. The leaderboard page has no standalone
 * counterpart, so a plain Vue component is fine here.
 *
 * A plain `<a href="/game-jam">` rather than a router-link: vue-router isn't
 * a shared module between this remote and the host (see vite.config.js), so
 * this can't assume a router instance exists — same reasoning GameTile.vue
 * uses for its own links.
 *
 * Deliberately NOT a fixed/floating overlay: the leaderboard's own header
 * already occupies the top-left corner, so this renders as its own slim bar
 * ABOVE the page's markup instead of overlapping it. Uses its own
 * self-contained colors rather than the leaderboard's CSS variables, since
 * it's meant to look identical regardless of theme.
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

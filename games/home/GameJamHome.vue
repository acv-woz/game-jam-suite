<template>
  <div class="home-root">
    <div class="wrap">
      <header class="top">
        <nav
          id="topNav"
          class="top-nav"
        ></nav>
        <p class="eyebrow">ACV internal &middot; hackathon build</p>
        <h1>Game Jam Suite</h1>
        <p class="sub">Pick a game to play. Each one's a standalone, client-only build &mdash; no account, no setup.</p>
      </header>

      <div
        id="grid"
        class="grid"
      ></div>

      <footer class="note">
        Source &amp; READMEs: <a
          href="https://github.com/acv-woz/game-jam-suite"
          target="_blank"
          rel="noopener"
        >game-jam-suite</a>
        &middot; Got an idea for the next one? <a
          href="https://claude.ai/artifact/2zow4XXrz3z93xAvcRYF4q"
          target="_blank"
          rel="noopener"
        >pitch it on the board</a>.
      </footer>
    </div>
  </div>
</template>

<script setup>
import useEmbeddedGame from '../shared/useEmbeddedGame';

/*
 * Wraps the same standalone games/home/web/{index.html,style.css,app.js}
 * every other game's MFE component wraps (see e.g.
 * games/guess-the-deal/web/mfe/GuessTheDealApp.vue) — one tile grid, driven
 * entirely by app.js, works identically standalone (python3 -m http.server)
 * and embedded here. No Home nav here: this already is the home page.
 */
useEmbeddedGame('home');
</script>

<template>
  <div class="home-root">
    <div class="wrap">
      <header class="top">
        <nav
          id="topNav"
          class="top-nav"
        ></nav>
        <h1>Game Jam Suite</h1>
        <p class="sub">Play. Compete. Win.</p>
      </header>

      <div
        id="grid"
        class="grid"
      ></div>
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

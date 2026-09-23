<template>
  <div class="reveal-the-deal-root">
    <nav class="game-nav" id="gameNav"></nav>

    <div class="wrap">
      <header class="top">
        <div class="title-block">
          <p class="eyebrow" id="puzzleNumber">Reveal the Deal #&mdash;</p>
          <h1>Reveal the Deal</h1>
          <p class="sub">Every guess flips a few more tiles on a real sold listing's photo. Name the make, model and year before the picture's fully uncovered.</p>
        </div>
        <div class="stats">
          <div class="stat"><b id="statGuesses">0/6</b><span>guesses</span></div>
          <div class="stat"><b id="statTiles">0/20</b><span>tiles</span></div>
          <div class="stat"><b id="statBest">&mdash;</b><span>best</span></div>
        </div>
      </header>

      <div class="day-strip" id="dayStrip"></div>

      <p class="flavor" id="flavorText"></p>

      <div class="board-shell">
        <div class="reveal-photo" id="revealPhoto">
          <img class="reveal-img" id="revealImg" alt="">
          <div class="tile-grid" id="tileGrid"></div>
        </div>
      </div>

      <form class="guess-form" id="guessForm" autocomplete="off">
        <div class="guess-input-wrap">
          <input type="text" id="guessInput" placeholder="Type a make or model…" autocomplete="off" aria-label="Guess a vehicle">
          <ul class="suggestions" id="suggestions" hidden></ul>
        </div>
        <button type="submit" class="btn-primary" id="submitGuess">Guess</button>
      </form>

      <footer class="note">Only real vehicles from today's pool are valid guesses. Practice any day from the strip above.</footer>
    </div>

    <div class="modal-backdrop" id="endBackdrop" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="endTitle">
        <p class="eyebrow" id="endEyebrow">&mdash;</p>
        <h2 id="endTitle">&mdash;</h2>
        <p class="end-answer" id="endAnswer"></p>
        <div class="win-stats">
          <div><b id="endGuesses">0</b><span>guesses</span></div>
          <div><b id="endTiles">0</b><span>tiles</span></div>
        </div>
        <form class="save-score-row" id="saveScoreForm">
          <input type="text" id="playerName" class="player-name-input" placeholder="Your name for the leaderboard" maxlength="24">
          <button type="submit" class="btn-primary" id="btnSaveScore">Save Score</button>
        </form>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" id="endClose">Close</button>
          <button type="button" class="btn-primary" id="endCopy">Copy result</button>
        </div>
      </div>
    </div>

    <div id="toast" role="status"></div>
  </div>
</template>

<script setup>
import useEmbeddedGame from '../../../shared/useEmbeddedGame';

// dealerId/userId/username come from the host page's logged-in user (see
// RevealTheDealPage.vue in acv-web-vuejs) — null there for now until that's
// wired up; username still gets prefilled from a remembered value if this
// stays null (see loadSavedUsername in this game's app.js).
const props = defineProps({
  dealerId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: null },
  username: { type: String, default: null },
});

useEmbeddedGame('reveal-the-deal', {
  dealerId: props.dealerId,
  userId: props.userId,
  username: props.username,
});
</script>

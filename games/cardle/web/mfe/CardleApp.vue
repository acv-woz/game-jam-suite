<template>
  <div class="cardle-root">
    <nav class="game-nav" id="gameNav"></nav>

    <div class="wrap">
      <header class="top">
        <div class="title-block">
          <p class="eyebrow" id="puzzleNumber">Cardle #&mdash;</p>
          <h1>Cardle</h1>
          <p class="sub">Today's vehicle, narrowed to a body style, drivetrain, origin and price tier &mdash; find the exact make, model and year in 6 tries.</p>
        </div>
        <div class="stats">
          <div class="stat"><b id="statGuesses">0/6</b><span>guesses</span></div>
          <div class="stat"><b id="statStreak">0</b><span>streak</span></div>
        </div>
      </header>

      <div class="day-strip" id="dayStrip"></div>

      <div class="clue-card">
        <p class="clue-heading">Today's clues</p>
        <div class="clue-chips" id="clueChips"></div>
        <button type="button" class="link-btn" id="toggleCandidates" aria-expanded="false" aria-controls="candidateList">
          Show vehicles matching these clues
        </button>
        <ul class="candidate-list" id="candidateList" hidden></ul>
      </div>

      <div class="col-labels" id="colLabels"></div>
      <div class="grid" id="grid"></div>

      <form class="guess-form" id="guessForm" autocomplete="off">
        <div class="guess-input-wrap">
          <input type="text" id="guessInput" placeholder="Type a make or model…" autocomplete="off" aria-label="Guess a vehicle">
          <ul class="suggestions" id="suggestions" hidden></ul>
        </div>
        <button type="submit" class="btn-primary" id="submitGuess">Guess</button>
      </form>

      <footer class="note">Only real vehicles from today's pool are valid guesses &mdash; pick one from the list as you type, or check the clue card above if you're stuck. Practice any day from the strip above.</footer>
    </div>

    <div class="modal-backdrop" id="endBackdrop" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="endTitle">
        <p class="eyebrow" id="endEyebrow">&mdash;</p>
        <h2 id="endTitle">&mdash;</h2>
        <p class="end-answer" id="endAnswer"></p>
        <div class="win-stats">
          <div><b id="endGuesses">0</b><span>guesses</span></div>
          <div><b id="endStreak">0</b><span>streak</span></div>
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
// CardlePage.vue in acv-web-vuejs) — null there for now until that's wired
// up; username still gets prefilled from a remembered value if this stays
// null (see loadSavedUsername in this game's app.js).
const props = defineProps({
  dealerId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: null },
  username: { type: String, default: null },
});

useEmbeddedGame('cardle', {
  dealerId: props.dealerId,
  userId: props.userId,
  username: props.username,
});
</script>

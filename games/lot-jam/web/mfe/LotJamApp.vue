<template>
  <div class="lot-jam-root">
    <nav class="game-nav" id="gameNav"></nav>

    <div class="wrap">
      <header class="top">
        <div class="title-block">
          <p class="eyebrow" id="puzzleNumber">Lot Jam #&mdash;</p>
          <h1>Lot Jam</h1>
          <p class="sub">Clear a path out of the lot. Drag the parked cars, get the <span class="target-swatch"></span> car to the exit.</p>
        </div>
        <div class="stats">
          <div class="stat"><b id="statMoves">0</b><span>moves</span></div>
          <div class="stat"><b id="statPar">&mdash;</b><span>par</span></div>
          <div class="stat"><b id="statTime">0:00</b><span>time</span></div>
        </div>
      </header>

      <div class="day-strip" id="dayStrip"></div>

      <p class="flavor" id="flavorText"></p>

      <div class="board-shell">
        <div class="board" id="board">
          <div class="exit-marker" id="exitMarker">
            <span>EXIT</span>
          </div>
        </div>
      </div>

      <div class="controls">
        <button type="button" class="btn-ghost" id="undoBtn">Undo</button>
        <button type="button" class="btn-ghost" id="resetBtn">Reset puzzle</button>
        <div class="best" id="bestNote"></div>
      </div>

      <footer class="note">Practice any day from the strip above &mdash; only today's puzzle counts toward your streak.</footer>
    </div>

    <div class="modal-backdrop" id="winBackdrop" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="winTitle">
        <p class="eyebrow">Cleared the lot</p>
        <h2 id="winTitle">&mdash;</h2>
        <div class="win-stats">
          <div><b id="winMoves">0</b><span>moves</span></div>
          <div><b id="winPar">0</b><span>par</span></div>
          <div><b id="winTime">0:00</b><span>time</span></div>
        </div>
        <p class="rank" id="winRank"></p>
        <form class="save-score-row" id="saveScoreForm">
          <input type="text" id="playerName" class="player-name-input" placeholder="Your name for the leaderboard" maxlength="24">
          <button type="submit" class="btn-primary">Save Score</button>
        </form>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" id="winClose">Close</button>
          <button type="button" class="btn-primary" id="winCopy">Copy result</button>
        </div>
      </div>
    </div>

    <div id="toast" role="status"></div>
  </div>
</template>

<script setup>
import useEmbeddedGame from '../../../shared/useEmbeddedGame';

// dealerId/userId/username come from the host page's logged-in user (see
// GameJamLotJamPage.vue in acv-web-vuejs) — null there for now until that's
// wired up; username still gets prefilled from a remembered value if this
// stays null (see loadSavedUsername in this game's app.js).
const props = defineProps({
  dealerId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: null },
  username: { type: String, default: null },
});

useEmbeddedGame('lot-jam', {
  dealerId: props.dealerId,
  userId: props.userId,
  username: props.username,
});
</script>

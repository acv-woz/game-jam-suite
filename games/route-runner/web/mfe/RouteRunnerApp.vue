<template>
  <div class="route-runner-root">
    <nav class="game-nav" id="gameNav"></nav>

    <div class="wrap">
      <header class="top">
        <div class="title-block">
          <p class="eyebrow" id="puzzleNumber">Route Runner #&mdash;</p>
          <h1>Route Runner</h1>
          <p class="sub">Connect the numbered stops in order with one line that covers every tile. No crossing your own path.</p>
        </div>
        <div class="stats">
          <div class="stat"><b id="statStops">0/0</b><span>stops</span></div>
          <div class="stat"><b id="statCells">0/0</b><span>tiles</span></div>
          <div class="stat"><b id="statTime">0:00</b><span>time</span></div>
        </div>
      </header>

      <div class="day-strip" id="dayStrip"></div>

      <p class="flavor" id="flavorText"></p>

      <div class="board-shell">
        <div class="board" id="board">
          <svg class="path-overlay" id="pathSvg">
            <polyline class="path-line" id="pathLine" points=""></polyline>
          </svg>
        </div>
      </div>

      <div class="controls">
        <button type="button" class="btn-ghost" id="undoBtn">Undo</button>
        <button type="button" class="btn-ghost" id="resetBtn">Reset route</button>
        <div class="best" id="bestNote"></div>
      </div>

      <footer class="note">Drag from stop 1. Each date can only be solved once, ever &mdash; practice past days from the strip above.</footer>
    </div>

    <div class="modal-backdrop" id="winBackdrop" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="winTitle">
        <p class="eyebrow">Route complete</p>
        <h2 id="winTitle">&mdash;</h2>
        <div class="win-stats">
          <div><b id="winTime">0:00</b><span>time</span></div>
          <div><b id="winStops">0</b><span>stops</span></div>
        </div>
        <ul class="bonus-list" id="winBonuses">
          <li class="bonus-item" id="bonusNoRetrace" data-key="noRetrace">
            <span class="bonus-icon"></span><span class="bonus-label">Clean route &mdash; no retraces</span>
          </li>
          <li class="bonus-item" id="bonusNoLift" data-key="noLift">
            <span class="bonus-icon"></span><span class="bonus-label">One continuous drag</span>
          </li>
        </ul>
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

useEmbeddedGame('route-runner', { extraScripts: ['generator.js'] });
</script>

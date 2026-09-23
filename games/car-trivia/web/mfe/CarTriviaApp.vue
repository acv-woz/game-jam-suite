<template>
  <div class="ct-app">
    <nav class="game-nav" id="gameNav"></nav>

    <header class="ct-topbar">
      <div class="ct-topbar-stats" id="topbarStats" hidden>
        <div class="ct-topbar-stat">
          <span class="ct-topbar-stat-label">Score</span>
          <span class="ct-topbar-stat-value" id="liveScore">0</span>
        </div>
        <div class="ct-topbar-stat">
          <span class="ct-topbar-stat-label">Time</span>
          <span class="ct-topbar-stat-value" id="liveTime">0:00</span>
        </div>
      </div>
    </header>

    <main>

      <!-- START SCREEN -->
      <section class="ct-screen ct-screen-start" id="screen-start">
        <div class="ct-hero">
          <p class="ct-eyebrow">Daily Round</p>
          <h1>Think you know cars?</h1>
          <p class="ct-subtitle">
            5 questions today, one from each category plus a wildcard:
            Supercars &amp; Speed, Logos &amp; Branding, Pop Culture &amp; Movies,
            and Firsts &amp; History. 1 point per correct answer &mdash;
            ties are broken by whoever finishes fastest.
          </p>
          <button class="ct-btn ct-btn-primary ct-btn-lg" id="btnStart">Start Trivia</button>
          <button class="ct-btn ct-btn-ghost" id="btnShowBoard">View Leaderboard</button>
        </div>
      </section>

      <!-- GAME SCREEN -->
      <section class="ct-screen ct-screen-game" id="screen-game" hidden>
        <div class="ct-progress-row">
          <div class="ct-progress-track">
            <div class="ct-progress-fill" id="progressFill"></div>
          </div>
          <span class="ct-progress-label" id="progressLabel">Question 1 / 5</span>
        </div>

        <div class="ct-clue-card">
          <span class="ct-theme-badge" id="themeBadge">Theme</span>
          <p class="ct-clue-question" id="clueQuestion">Question text</p>
        </div>

        <div class="ct-options" id="options"></div>

        <div class="ct-actions">
          <button class="ct-btn ct-btn-primary ct-btn-lg" id="btnSubmit" disabled>Submit Answer</button>
          <button class="ct-btn ct-btn-primary ct-btn-lg" id="btnNext" hidden>Next Question</button>
        </div>
      </section>

      <!-- END SCREEN -->
      <section class="ct-screen ct-screen-end" id="screen-end" hidden>
        <div class="ct-end-card">
          <p class="ct-eyebrow">Round Complete</p>
          <div class="ct-end-rank" id="endRank">🏆 Trivia Ace</div>
          <div class="ct-end-score-label">Final Score</div>
          <div class="ct-end-score" id="endScore">0 / 5</div>
          <div class="ct-end-sub" id="endSub">Finished in 0:00</div>

          <form class="ct-save-score-row" id="saveScoreForm">
            <input type="text" id="playerName" class="ct-player-name-input" placeholder="Your name for the leaderboard" maxlength="24" />
            <button type="submit" class="ct-btn ct-btn-primary">Save Score</button>
          </form>

          <div class="ct-end-actions">
            <button class="ct-btn ct-btn-primary ct-btn-lg" id="btnPlayAgain">Play Again</button>
            <button class="ct-btn ct-btn-ghost" id="btnViewBoardEnd">View Leaderboard</button>
            <button type="button" class="ct-btn ct-btn-ghost" id="btnCopyResult">Copy result</button>
          </div>
        </div>
      </section>

    </main>

    <div class="ct-feedback" id="feedback" hidden>
      <div class="ct-feedback-banner" id="feedbackBanner">
        <span class="ct-feedback-icon" id="feedbackIcon">✅</span>
        <span class="ct-feedback-text" id="feedbackText">Correct!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import useEmbeddedGame from '../../../shared/useEmbeddedGame';

// dealerId/userId/username come from the host page's logged-in user (see
// CarTriviaPage.vue in acv-web-vuejs) — null there for now until that's
// wired up; username still gets prefilled from a remembered value if this
// stays null (see loadSavedUsername in this game's app.js).
const props = defineProps({
  dealerId: { type: [Number, String], default: null },
  userId: { type: [Number, String], default: null },
  username: { type: String, default: null },
});

useEmbeddedGame('car-trivia', {
  dealerId: props.dealerId,
  userId: props.userId,
  username: props.username,
});
</script>

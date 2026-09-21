<template>
  <div class="game-jam-home">
    <header class="game-jam-home__header">
      <h1 class="game-jam-home__title">Game Jam</h1>
      <p class="game-jam-home__subtitle">Pick a game to play</p>
    </header>

    <div class="game-jam-home__grid">
      <GameTile
        v-for="game in games"
        :key="game.slug"
        :title="game.title"
        :description="game.description"
        :href="game.href"
        :accent="game.accent"
      />
    </div>
  </div>
</template>

<script setup>
import GameTile from './GameTile.vue';

const games = [
  {
    slug: 'guess-the-deal',
    title: 'Guess the Deal',
    description: 'How sharp is your eye on a deal? Guess the hidden sale price or mileage.',
    href: '/game-jam/guess-the-deal',
    accent: '#2f5dfc',
  },
  {
    slug: 'lot-jam',
    title: 'Lot Jam',
    description: 'Clear a path out of the lot by sliding the parked cars out of the way.',
    href: '/game-jam/lot-jam',
    accent: '#ffb020',
  },
  {
    slug: 'car-trivia',
    title: 'Car Trivia',
    description: 'Five daily questions on supercars, logos, movies, and automotive history.',
    href: '/game-jam/car-trivia',
    accent: '#0a1172',
  },
  {
    slug: 'cardle',
    title: 'Cardle',
    description: "Guess today's vehicle by make, model, and year in 6 tries — clues included.",
    href: '/game-jam/cardle',
    accent: '#8074cf',
  },
  {
    slug: 'reveal-the-deal',
    title: 'Reveal the Deal',
    description: 'Each guess flips more tiles on a real sold listing’s photo — name it before it’s fully revealed.',
    href: '/game-jam/reveal-the-deal',
    accent: '#e2635a',
  },
  {
    slug: 'route-runner',
    title: 'Route Runner',
    description: 'Connect every numbered stop with one line that covers the whole board, no crossing your own path.',
    href: '/game-jam/route-runner',
    accent: '#3bb5a0',
  },
];
</script>

<style scoped>
.game-jam-home {
  padding: 32px 24px 48px;
  max-width: 1100px;
  margin: 0 auto;
}

.game-jam-home__header {
  margin-bottom: 28px;
  text-align: center;
}

.game-jam-home__title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 6px;
  color: #1c2434;
}

.game-jam-home__subtitle {
  font-size: 14px;
  color: #64708a;
  margin: 0;
}

/* 4 tiles per row, stepping down at narrower widths. */
.game-jam-home__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1100px) {
  .game-jam-home__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 820px) {
  .game-jam-home__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 520px) {
  .game-jam-home__grid { grid-template-columns: 1fr; }
}
</style>

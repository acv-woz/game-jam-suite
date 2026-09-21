<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-leaderboard"
  >
    <LeaderboardPage />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const LeaderboardPage = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/LeaderboardPage'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
}
</style>

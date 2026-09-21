<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-car-trivia"
  >
    <CarTriviaApp />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const CarTriviaApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/CarTriviaApp'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: radial-gradient(
    140% 120% at 50% -10%,
    var(--ct-board-2, #0d1a8f),
    var(--ct-board, #0a1172)
  );
}
</style>

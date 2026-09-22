<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-guess-the-deal"
  >
    <GuessTheDealApp />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const GuessTheDealApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/GuessTheDealApp'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: var(--bg, #fafafa);
}
</style>

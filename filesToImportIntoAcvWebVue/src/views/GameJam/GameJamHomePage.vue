<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-home"
  >
    <GameJamHome />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const GameJamHome = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/GameJamHome'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
}
</style>

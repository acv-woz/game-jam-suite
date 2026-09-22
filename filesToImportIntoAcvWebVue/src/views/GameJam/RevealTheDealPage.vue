<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-reveal-the-deal"
  >
    <RevealTheDealApp />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const RevealTheDealApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/RevealTheDealApp'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: radial-gradient(
    120% 140% at 50% -10%,
    var(--asphalt-2, #f1f1f1),
    var(--asphalt, #fafafa)
  );
}
</style>

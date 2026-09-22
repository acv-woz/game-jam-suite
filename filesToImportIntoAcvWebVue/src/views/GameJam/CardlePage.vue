<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-cardle"
  >
    <CardleApp />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const CardleApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/CardleApp'),
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

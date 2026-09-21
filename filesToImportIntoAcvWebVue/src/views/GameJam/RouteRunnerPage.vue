<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-route-runner"
  >
    <RouteRunnerApp />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import importFederation from '@/utilities/mfe/importFederation';

const RouteRunnerApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/RouteRunnerApp'),
);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: radial-gradient(
    120% 140% at 50% -10%,
    var(--asphalt-2, #26282f),
    var(--asphalt, #1d1f25)
  );
}
</style>

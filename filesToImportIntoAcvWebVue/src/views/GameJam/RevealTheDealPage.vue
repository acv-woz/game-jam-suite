<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-reveal-the-deal"
  >
    <RevealTheDealApp
      :dealer-id="dealerId"
      :user-id="userId"
      :username="username"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { store } from '@/appContext';
import importFederation from '@/utilities/mfe/importFederation';

const RevealTheDealApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/RevealTheDealApp'),
);

const dealerId = computed(() => store.getters.currentUser.defaultDealerId);
const userId = computed(() => store.getters.currentUser.id);
const username = computed(() => store.getters.currentUser.fullName);
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

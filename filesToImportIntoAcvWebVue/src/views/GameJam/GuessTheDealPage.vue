<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-guess-the-deal"
  >
    <GuessTheDealApp
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

const GuessTheDealApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/GuessTheDealApp'),
);

const dealerId = computed(() => store.getters.currentUser.defaultDealerId);
const userId = computed(() => store.getters.currentUser.id);
const username = computed(() => store.getters.currentUser.fullName);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: var(--bg, #fafafa);
}
</style>

<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-car-trivia"
  >
    <CarTriviaApp
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

const CarTriviaApp = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/CarTriviaApp'),
);

const dealerId = computed(() => store.getters.currentUser.defaultDealerId);
const userId = computed(() => store.getters.currentUser.id);
const username = computed(() => store.getters.currentUser.fullName);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
  background: radial-gradient(
    140% 120% at 50% -10%,
    var(--ct-board-2, #f1f1f1),
    var(--ct-board, #fafafa)
  );
}
</style>

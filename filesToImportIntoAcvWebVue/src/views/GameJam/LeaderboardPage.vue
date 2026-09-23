<template>
  <div
    class="game-jam-page"
    data-e2e-id="game-jam-leaderboard"
  >
    <LeaderboardPage
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

const LeaderboardPage = defineAsyncComponent(
  // eslint-disable-next-line import/no-unresolved
  () => importFederation('gameJam/LeaderboardPage'),
);

const dealerId = computed(() => store.getters.currentUser.defaultDealerId);
const userId = computed(() => store.getters.currentUser.id);
const username = computed(() => store.getters.currentUser.fullName);
</script>

<style scoped>
.game-jam-page {
  min-height: inherit;
}
</style>

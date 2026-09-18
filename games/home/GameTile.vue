<template>
  <a
    class="game-tile"
    :href="href"
    :style="{ '--game-tile-accent': accent }"
  >
    <div class="game-tile__thumb">
      <span class="game-tile__initial">{{ initial }}</span>
    </div>
    <h2 class="game-tile__title">{{ title }}</h2>
    <p class="game-tile__description">{{ description }}</p>
  </a>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  href: { type: String, required: true },
  accent: { type: String, default: '#2f5dfc' },
});

const initial = computed(() => props.title.trim().charAt(0).toUpperCase());
</script>

<style scoped>
/*
 * Class names are deliberately namespaced (`game-tile__x`, not `card`/`title`)
 * — this renders embedded inside acv-web-vuejs next to Bootstrap, and generic
 * names have repeatedly collided with Bootstrap's own global classes there
 * (see the `.btn`/`.modal` fixes in the other games' stylesheets).
 */
.game-tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 8px 20px -12px rgba(15, 23, 42, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.game-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -14px rgba(15, 23, 42, 0.35);
}

.game-tile__thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--game-tile-accent, #2f5dfc);
}

.game-tile__initial {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
}

.game-tile__title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #1c2434;
}

.game-tile__description {
  font-size: 13px;
  color: #64708a;
  margin: 0;
  line-height: 1.4;
}
</style>

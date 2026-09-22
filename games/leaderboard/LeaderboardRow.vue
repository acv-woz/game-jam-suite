<template>
  <li class="lp-row">
    <span
      class="lp-rank"
      :class="rankClass"
    >{{ entry.rank }}</span>
    <span
      class="lp-avatar"
      :style="{ background: avatarColor }"
    >{{ initials }}</span>
    <span class="lp-name">{{ name }}</span>
    <span class="lp-score">{{ scoreText }}<i v-if="scoreUnit">{{ scoreUnit }}</i></span>
  </li>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  entry: { type: Object, required: true },
  game: { type: Object, required: true },
  name: { type: String, required: true },
  avatarColor: { type: String, required: true },
});

const rankClass = computed(() => (props.entry.rank <= 3 ? `medal-${props.entry.rank}` : ''));

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/);
  const a = parts[0] ? parts[0][0] : '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
});

const scoreText = computed(() => {
  const value = props.entry.score;
  if (value == null) return '—';
  const g = props.game;
  if (g.fmt === 'time') {
    const m = Math.floor(value / 60);
    const s = Math.round(value % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return String((Math.round(value * 10) % 10 === 0) ? Math.round(value) : value);
});

const scoreUnit = computed(() => (props.game.fmt === 'time' ? '' : props.game.unit));
</script>

<style scoped>
/* Scoped under `lp-` — see the naming note in LeaderboardPage.vue. */
.lp-row { display: flex; align-items: center; gap: 14px; padding: 9px 20px; }
.lp-row + .lp-row { border-top: 1px solid var(--lp-hairline); }
.lp-rank {
  width: 28px; flex-shrink: 0; text-align: center; font-weight: 700;
  font-size: 13.5px; color: var(--lp-ink-dim); font-variant-numeric: tabular-nums;
}
.lp-rank.medal-1 { color: #a8791b; }
.lp-rank.medal-2 { color: #7d7566; }
.lp-rank.medal-3 { color: #9a5a34; }
.lp-avatar {
  width: 27px; height: 27px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  font-size: 10.5px; font-weight: 700; color: var(--lp-accent-2-ink);
}
.lp-name { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lp-score { font-size: 13.5px; font-variant-numeric: tabular-nums; color: var(--lp-ink); flex-shrink: 0; }
.lp-score i { font-style: normal; color: var(--lp-ink-dim); font-size: 11px; margin-left: 3px; }
</style>

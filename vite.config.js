import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import federation from '@originjs/vite-plugin-federation';

/*
 * Serves/publishes everything under games/ at the site root (so
 * games/guess-the-deal/web/app.js is reachable at /guess-the-deal/web/app.js),
 * which keeps the existing standalone `python3 -m http.server` workflow for
 * each game's web/ folder identical to the URLs used here.
 */
export default defineConfig({
  publicDir: 'games',
  plugins: [
    vue(),
    federation({
      name: 'gameJam',
      filename: 'game-jam-remote-entry.js',
      exposes: {
        './GuessTheDealApp': './games/guess-the-deal/web/mfe/GuessTheDealApp.vue',
        './LotJamApp': './games/lot-jam/web/mfe/LotJamApp.vue',
        './CarTriviaApp': './games/car-trivia/web/mfe/CarTriviaApp.vue',
        './GameJamHome': './games/home/GameJamHome.vue',
      },
      shared: {
        vue: {},
      },
    }),
  ],
  build: {
    target: 'es2022',
    modulePreload: false,
    cssCodeSplit: false,
  },
  server: {
    port: 4444,
  },
  preview: {
    port: 4444,
  },
});

// insert at line 996.
{
    path: '/game-jam',
    name: 'GameJamHome',
    component: () => import('@/views/GameJam/GameJamHomePage.vue'),
    meta: {
      title: 'Game Jam',
    },
  },
  {
    path: '/game-jam/guess-the-deal',
    name: 'GuessTheDeal',
    component: () => import('@/views/GameJam/GuessTheDealPage.vue'),
    meta: {
      title: 'Guess the Deal',
    },
  },
  {
    path: '/game-jam/lot-jam',
    name: 'LotJam',
    component: () => import('@/views/GameJam/LotJamPage.vue'),
    meta: {
      title: 'Lot Jam',
    },
  },
  {
    path: '/game-jam/car-trivia',
    name: 'CarTrivia',
    component: () => import('@/views/GameJam/CarTriviaPage.vue'),
    meta: {
      title: 'Car Trivia',
    },
  },
  {
    path: '/game-jam/cardle',
    name: 'Cardle',
    component: () => import('@/views/GameJam/CardlePage.vue'),
    meta: {
      title: 'Cardle',
    },
  },
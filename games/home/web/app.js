(function () {
  'use strict';

  // Add a new game here when it moves from the board into games/<slug> —
  // nothing else on this page needs to change. `path` is relative to this
  // file (games/home/web/index.html) and is what standalone mode
  // (python3 -m http.server) links to. Drop a `<slug>.png` into images/ for
  // the tile art — see images/README.md; until it's there (or if it fails
  // to load), the tile falls back to a plain accent-colored initial.
  //
  // The leaderboard isn't in this list — it's not a game, so it doesn't get
  // a tile. It's a top-right nav button instead (see renderTopNav below),
  // matching how every game page links to it, rather than competing for
  // space in the grid.
  var GAMES = [
    {
      slug: 'guess-the-deal',
      title: 'Guess the Deal',
      tagline: 'Guess the hidden sale price or mileage against real closed-auction vehicles.',
      accent: '#2196f5', // ACV informational
      path: '../../guess-the-deal/web/index.html'
    },
    {
      slug: 'lot-jam',
      title: 'Lot Jam',
      tagline: 'Rush Hour-style sliding puzzle — clear a path out of the jammed lot.',
      accent: '#ffc000', // ACV caution
      path: '../../lot-jam/web/index.html'
    },
    {
      slug: 'route-runner',
      title: 'Route Runner',
      tagline: 'Zip-style puzzle — connect the numbered stops with one line covering every tile.',
      accent: '#004e7d', // ACV secondary
      path: '../../route-runner/web/index.html'
    },
    {
      slug: 'cardle',
      title: 'Cardle',
      tagline: 'Guess the daily vehicle in 6 tries — make, model, year, body, drivetrain, origin.',
      accent: '#7b61ff', // ACV focus
      path: '../../cardle/web/index.html'
    },
    {
      slug: 'reveal-the-deal',
      title: 'Reveal the Deal',
      tagline: 'Every guess flips more tiles off a listing photo — name the make, model and year first.',
      accent: '#ff5449', // ACV error
      path: '../../reveal-the-deal/web/index.html'
    },
    {
      slug: 'car-trivia',
      title: 'Car Trivia',
      tagline: 'Jeopardy-style trivia rounds about famous, iconic and unusual cars.',
      accent: '#f26522', // ACV primary
      path: '../../car-trivia/web/index.html'
    }
  ];

  var gridEl = document.getElementById('grid');

  function initial(title) { return title.trim().charAt(0).toUpperCase(); }

  // When embedded as an MFE, standalone relative paths (into a sibling
  // game's own games/<slug>/web/index.html) don't correspond to anything in
  // the host's SPA — the host routes each game at /game-jam/<slug> instead.
  // window.__GAME_JAM_DATA_BASE__ is only set when embedded (see
  // useEmbeddedGame.js), so its presence is what distinguishes the two.
  function isEmbedded() { return !!window.__GAME_JAM_DATA_BASE__; }

  function gameHref(game) {
    return isEmbedded() ? '/game-jam/' + game.slug : game.path;
  }

  // Top-right "Leaderboard" button — same embedded-only treatment as each
  // game page's own nav link (see e.g. guess-the-deal/web/app.js's
  // renderGameNav): the leaderboard has no standalone page to link to, so
  // this stays hidden outside the host instead of linking nowhere useful.
  function renderTopNav() {
    var navEl = document.getElementById('topNav');
    if (!navEl || !isEmbedded()) return;
    navEl.innerHTML = '<a href="/game-jam/leaderboard">Leaderboard &rarr;</a>';
  }

  // Unlike style.css's `url(images/gameHubBackground.png)` — which the
  // browser resolves against that *stylesheet's* own URL regardless of
  // where it's embedded — this HTML gets inserted into the *host* page via
  // innerHTML, so a relative <img src> would resolve against the host's
  // origin, not this remote's. Needs the same window.__GAME_JAM_DATA_BASE__
  // treatment as every other cross-origin fetch/src in this suite.
  function tileImageUrl(slug) {
    return isEmbedded()
      ? window.__GAME_JAM_DATA_BASE__ + '/home/web/images/' + slug + '.png'
      : 'images/' + slug + '.png';
  }

  function tileHtml(game) {
    return (
      '<a class="tile" href="' + gameHref(game) + '" style="--tile-accent:' + game.accent + '">' +
        '<div class="tile-thumb">' +
          '<img src="' + tileImageUrl(game.slug) + '" alt="" onerror="this.remove()">' +
          '<span class="tile-initial">' + initial(game.title) + '</span>' +
        '</div>' +
        '<h2>' + game.title + '</h2>' +
        '<p>' + game.tagline + '</p>' +
        '<span class="play">' + (game.cta || 'Play') + ' &rarr;</span>' +
      '</a>'
    );
  }

  function render() {
    if (!GAMES.length) {
      gridEl.innerHTML = '<div class="empty">No games wired up yet.</div>';
      return;
    }
    gridEl.innerHTML = GAMES.map(tileHtml).join('');
  }

  render();
  renderTopNav();
})();

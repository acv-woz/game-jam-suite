(function () {
  'use strict';

  // Add a new game here when it moves from the board into games/<slug> —
  // nothing else on this page needs to change. `path` is relative to this
  // file (games/home/web/index.html) and is what standalone mode
  // (python3 -m http.server) links to. Drop a `<slug>.png` into images/ for
  // the tile art — see images/README.md; until it's there (or if it fails
  // to load), the tile falls back to a plain accent-colored initial.
  //
  // `embeddedOnly: true` (currently just the leaderboard) hides an entry in
  // standalone mode instead of linking it — the leaderboard only exists as
  // a Vue component exposed via Module Federation, with no equivalent
  // standalone page under games/, so there's nothing for a relative link
  // to point to outside the host.
  var GAMES = [
    {
      slug: 'guess-the-deal',
      title: 'Guess the Deal',
      tagline: 'Guess the hidden sale price or mileage against real closed-auction vehicles.',
      accent: '#5b82ff',
      path: '../../guess-the-deal/web/index.html'
    },
    {
      slug: 'lot-jam',
      title: 'Lot Jam',
      tagline: 'Rush Hour-style sliding puzzle — clear a path out of the jammed lot.',
      accent: '#ffb020',
      path: '../../lot-jam/web/index.html'
    },
    {
      slug: 'route-runner',
      title: 'Route Runner',
      tagline: 'Zip-style puzzle — connect the numbered stops with one line covering every tile.',
      accent: '#3bb5a0',
      path: '../../route-runner/web/index.html'
    },
    {
      slug: 'cardle',
      title: 'Cardle',
      tagline: 'Guess the daily vehicle in 6 tries — make, model, year, body, drivetrain, origin.',
      accent: '#8074cf',
      path: '../../cardle/web/index.html'
    },
    {
      slug: 'reveal-the-deal',
      title: 'Reveal the Deal',
      tagline: 'Every guess flips more tiles off a listing photo — name the make, model and year first.',
      accent: '#e2635a',
      path: '../../reveal-the-deal/web/index.html'
    },
    {
      slug: 'car-trivia',
      title: 'Car Trivia',
      tagline: 'Jeopardy-style trivia rounds about famous, iconic and unusual cars.',
      accent: '#f5c518',
      path: '../../car-trivia/web/index.html'
    },
    {
      slug: 'leaderboard',
      title: 'Leaderboard',
      tagline: 'See how dealers rank across every game, by day or by week.',
      accent: '#c1443d',
      cta: 'View',
      embeddedOnly: true
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
    var visible = GAMES.filter(function (g) { return !g.embeddedOnly || isEmbedded(); });
    if (!visible.length) {
      gridEl.innerHTML = '<div class="empty">No games wired up yet.</div>';
      return;
    }
    gridEl.innerHTML = visible.map(tileHtml).join('');
  }

  render();
})();

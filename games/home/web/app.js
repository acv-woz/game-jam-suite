(function () {
  'use strict';

  // Add a new game here when it moves from the board into games/<slug> —
  // nothing else on this page needs to change. `path` is relative to this
  // file (games/home/web/index.html), same shape for every entry. Drop a
  // `<slug>.png` into images/ for the tile art — see images/README.md;
  // until it's there (or if it fails to load), the tile falls back to a
  // plain accent-colored initial.
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
    }
  ];

  var gridEl = document.getElementById('grid');

  function initial(title) { return title.trim().charAt(0).toUpperCase(); }

  function tileHtml(game) {
    return (
      '<a class="tile" href="' + game.path + '" style="--tile-accent:' + game.accent + '">' +
        '<div class="tile-thumb">' +
          '<img src="images/' + game.slug + '.png" alt="" onerror="this.remove()">' +
          '<span class="tile-initial">' + initial(game.title) + '</span>' +
        '</div>' +
        '<h2>' + game.title + '</h2>' +
        '<p>' + game.tagline + '</p>' +
        '<span class="play">Play &rarr;</span>' +
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
})();

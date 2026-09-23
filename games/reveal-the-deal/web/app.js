(function () {
  'use strict';

  // Shared "Home" / "Leaderboard" nav — see guess-the-deal/web/app.js for
  // the full write-up. window.__GAME_JAM_DATA_BASE__ is only set when
  // embedded.
  (function renderGameNav() {
    var navEl = document.getElementById('gameNav');
    if (!navEl) return;
    var embedded = !!window.__GAME_JAM_DATA_BASE__;
    var html = '<a href="' + (embedded ? '/game-jam' : '../../home/web/index.html') + '">&larr; Home</a>';
    if (embedded) {
      html += '<a href="/game-jam/leaderboard?game=reveal-the-deal" class="nav-lb">Leaderboard &rarr;</a>';
    }
    navEl.innerHTML = html;
  })();

  // Same rounds/pool as ../data/*.json, embedded so the game still works
  // when index.html is opened directly (file://), where fetch() is
  // blocked. Keep these in sync with the data files — see Lot Jam's
  // app.js for the same pattern.
  var FALLBACK_ROUNDS = {
    tileCols: 5, tileRows: 4, maxGuesses: 6,
    rounds: [
      { id: "r1", label: "Monday Lot", flavor: "SUV, sold out of the Midwest.", vehicle: { make: "Honda", model: "CR-V", year: 2019, trim: "EX-L AWD", color: "Modern Steel Metallic" }, image: "r1.jpg" },
      { id: "r2", label: "Tuesday Lot", flavor: "Truck, sold out of the South.", vehicle: { make: "Ford", model: "F-150", year: 2021, trim: "XLT SuperCrew 4x4", color: "Agate Black" }, image: "r2.jpg" },
      { id: "r3", label: "Wednesday Lot", flavor: "Sedan, sold out of the West.", vehicle: { make: "Toyota", model: "Camry", year: 2020, trim: "SE", color: "Celestial Silver" }, image: "r3.jpg" },
      { id: "r4", label: "Thursday Lot", flavor: "SUV, sold out of the Southwest.", vehicle: { make: "Jeep", model: "Wrangler", year: 2022, trim: "Sport 4x4", color: "Sarge Green" }, image: "r4.jpg" },
      { id: "r5", label: "Friday Lot", flavor: "Truck, sold out of the Midwest.", vehicle: { make: "Chevrolet", model: "Silverado", year: 2018, trim: "LT", color: "Summit White" }, image: "r5.jpg" },
      { id: "r6", label: "Saturday Lot", flavor: "SUV, sold out of the Northeast.", vehicle: { make: "Subaru", model: "Outback", year: 2021, trim: "Limited", color: "Crystal Black" }, image: "r6.jpg" },
      { id: "r7", label: "Sunday Lot", flavor: "Sedan, sold out of the West.", vehicle: { make: "Tesla", model: "Model 3", year: 2023, trim: "Long Range", color: "Pearl White" }, image: "r7.jpg" }
    ]
  };

  var FALLBACK_VEHICLES = [
    { make: "Honda", model: "CR-V", year: 2019 }, { make: "Ford", model: "F-150", year: 2021 },
    { make: "Toyota", model: "Camry", year: 2020 }, { make: "Jeep", model: "Wrangler", year: 2022 },
    { make: "Chevrolet", model: "Silverado", year: 2018 }, { make: "Subaru", model: "Outback", year: 2021 },
    { make: "Tesla", model: "Model 3", year: 2023 }, { make: "Honda", model: "CR-V", year: 2022 },
    { make: "Honda", model: "Civic", year: 2021 }, { make: "Ford", model: "F-150", year: 2019 },
    { make: "Ford", model: "Escape", year: 2020 }, { make: "Toyota", model: "Camry", year: 2022 },
    { make: "Toyota", model: "RAV4", year: 2021 }, { make: "Toyota", model: "Corolla", year: 2019 },
    { make: "Jeep", model: "Wrangler", year: 2020 }, { make: "Jeep", model: "Grand Cherokee", year: 2021 },
    { make: "Chevrolet", model: "Silverado", year: 2021 }, { make: "Chevrolet", model: "Equinox", year: 2020 },
    { make: "Chevrolet", model: "Tahoe", year: 2019 }, { make: "Subaru", model: "Outback", year: 2019 },
    { make: "Subaru", model: "Forester", year: 2020 }, { make: "Tesla", model: "Model 3", year: 2021 },
    { make: "Tesla", model: "Model Y", year: 2022 }, { make: "BMW", model: "3 Series", year: 2021 },
    { make: "Mercedes-Benz", model: "C-Class", year: 2020 }, { make: "Nissan", model: "Altima", year: 2019 },
    { make: "Hyundai", model: "Tucson", year: 2021 }, { make: "Kia", model: "Telluride", year: 2022 },
    { make: "Mazda", model: "CX-5", year: 2020 }, { make: "Ram", model: "1500", year: 2021 },
    { make: "GMC", model: "Sierra", year: 2019 }, { make: "Volkswagen", model: "Jetta", year: 2020 },
    { make: "Dodge", model: "Charger", year: 2019 }
  ];

  var EPOCH = Date.UTC(2026, 8, 14); // same arbitrary Monday reference used across the suite
  var DAY_TAGS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ---- seeded RNG, reused only to make each round's tile-reveal order
  // deterministic (same round always reveals in the same order) ----

  function seedFromString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) | 0;
      var t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Simple inline placeholder for rounds with no real photo dropped into
  // images/ yet — a generic car glyph, hue varied per round so the seven
  // placeholders aren't all identical. Swapped in via the <img> onerror
  // handler, so a real photo just needs to exist at the right filename.
  function placeholderDataUri(seedStr) {
    var hue = seedFromString(seedStr) % 360;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400">' +
      '<rect width="500" height="400" fill="hsl(' + hue + ',16%,15%)"/>' +
      '<g fill="hsl(' + hue + ',14%,27%)" transform="translate(120,150)">' +
        '<path d="M10 60 L40 20 L220 20 L250 60 L260 90 L260 112 L0 112 L0 90 Z"/>' +
        '<circle cx="55" cy="112" r="24" fill="hsl(' + hue + ',10%,13%)"/>' +
        '<circle cx="205" cy="112" r="24" fill="hsl(' + hue + ',10%,13%)"/>' +
      '</g>' +
      '<text x="250" y="368" font-family="monospace" font-size="15" fill="hsl(' + hue + ',10%,55%)" text-anchor="middle">Photo coming soon</text>' +
    '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function vehicleKey(v) { return v.make + '|' + v.model + '|' + v.year; }

  // ---- DOM refs ----

  var puzzleNumberEl = document.getElementById('puzzleNumber');
  var statGuesses = document.getElementById('statGuesses');
  var statTiles = document.getElementById('statTiles');
  var statBest = document.getElementById('statBest');
  var dayStripEl = document.getElementById('dayStrip');
  var flavorEl = document.getElementById('flavorText');
  var revealImg = document.getElementById('revealImg');
  var tileGridEl = document.getElementById('tileGrid');
  var guessForm = document.getElementById('guessForm');
  var guessInput = document.getElementById('guessInput');
  var suggestionsEl = document.getElementById('suggestions');
  var toastEl = document.getElementById('toast');
  var endBackdrop = document.getElementById('endBackdrop');
  var endEyebrow = document.getElementById('endEyebrow');
  var endTitle = document.getElementById('endTitle');
  var endAnswer = document.getElementById('endAnswer');
  var endGuesses = document.getElementById('endGuesses');
  var endTiles = document.getElementById('endTiles');
  var endClose = document.getElementById('endClose');
  var endCopy = document.getElementById('endCopy');
  var saveScoreForm = document.getElementById('saveScoreForm');
  var playerName = document.getElementById('playerName');

  // Shared player-identity convention across every game in the suite — see
  // guess-the-deal/web/app.js for the full write-up.
  function loadSavedUsername() {
    try { return localStorage.getItem('gamejam-username') || ''; } catch (e) { return ''; }
  }
  function rememberUsername(name) {
    try { if (name) localStorage.setItem('gamejam-username', name); } catch (e) { /* storage unavailable */ }
  }
  function prefilledUsername() {
    var user = window.__GAME_JAM_USER__;
    return (user && user.username) || loadSavedUsername();
  }

  var rounds = [];
  var vehicles = [];
  var tileCols = 5, tileRows = 4, maxGuesses = 6;
  var totalTiles = 20;
  var todayIndex = 0;
  var puzzleNumber = 1;
  var currentIndex = 0;
  var round = null;
  var revealOrder = [];
  var guesses = [];
  var done = false;
  var highlightIndex = -1;
  var currentSuggestions = [];
  var toastTimer = null;
  var roundStartTs = null;
  var finalAttemptSec = 0;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function daysSinceEpoch() {
    return Math.max(0, Math.floor((Date.now() - EPOCH) / 86400000));
  }

  // ---- best score (per round id, unlimited replays — same convention as Lot Jam) ----

  function bestKey(id) { return 'revealthedeal-best-' + id; }
  function loadBest(id) {
    try {
      var raw = localStorage.getItem(bestKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveBestIfBetter(id, guessCount, tilesUsed) {
    var best = loadBest(id);
    if (!best || guessCount < best.guesses) {
      try { localStorage.setItem(bestKey(id), JSON.stringify({ guesses: guessCount, tiles: tilesUsed })); }
      catch (e) { /* storage unavailable */ }
      return true;
    }
    return false;
  }
  function renderBestNote() {
    var best = loadBest(round.id);
    statBest.textContent = best ? (best.guesses + '/' + maxGuesses) : '—';
    return best;
  }

  // ---- feedback / win ----

  function isWin(guess) { return vehicleKey(guess) === vehicleKey(round.vehicle); }
  function guessedKeys() { return guesses.map(vehicleKey); }

  function revealCountFor(n) {
    if (n <= 0) return 0;
    if (n >= maxGuesses) return totalTiles;
    return Math.min(totalTiles, Math.round(n * totalTiles / maxGuesses));
  }

  // ---- suggestions / guess input ----

  function filterSuggestions(query) {
    var q = query.trim().toLowerCase();
    if (!q) return [];
    var already = guessedKeys();
    return vehicles
      .filter(function (v) { return already.indexOf(vehicleKey(v)) === -1; })
      .filter(function (v) { return (v.make + ' ' + v.model).toLowerCase().indexOf(q) !== -1; })
      .slice(0, 8);
  }

  function renderSuggestions() {
    if (!currentSuggestions.length) {
      suggestionsEl.hidden = true;
      suggestionsEl.innerHTML = '';
      return;
    }
    suggestionsEl.hidden = false;
    suggestionsEl.innerHTML = currentSuggestions.map(function (v, i) {
      return '<li data-index="' + i + '" class="' + (i === highlightIndex ? 'highlight' : '') + '">' +
        '<span>' + v.make + ' ' + v.model + '</span><span class="yr">' + v.year + '</span>' +
      '</li>';
    }).join('');
  }

  guessInput.addEventListener('input', function () {
    currentSuggestions = filterSuggestions(guessInput.value);
    highlightIndex = currentSuggestions.length ? 0 : -1;
    renderSuggestions();
  });

  guessInput.addEventListener('keydown', function (e) {
    if (!currentSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = (highlightIndex + 1) % currentSuggestions.length;
      renderSuggestions();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = (highlightIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
      renderSuggestions();
    } else if (e.key === 'Escape') {
      currentSuggestions = [];
      highlightIndex = -1;
      renderSuggestions();
    }
  });

  suggestionsEl.addEventListener('mousedown', function (e) {
    var li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    commitGuess(currentSuggestions[parseInt(li.getAttribute('data-index'), 10)]);
  });

  guessForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (done) return;
    if (highlightIndex === -1 || !currentSuggestions[highlightIndex]) {
      toast('Pick a vehicle from the list.');
      return;
    }
    commitGuess(currentSuggestions[highlightIndex]);
  });

  function commitGuess(vehicle) {
    if (done) return;
    guesses.push(vehicle);
    statGuesses.textContent = guesses.length + '/' + maxGuesses;
    guessInput.value = '';
    currentSuggestions = [];
    highlightIndex = -1;
    renderSuggestions();

    var won = isWin(vehicle);
    renderTiles(won || guesses.length >= maxGuesses ? totalTiles : revealCountFor(guesses.length));

    if (won) finish(true);
    else if (guesses.length >= maxGuesses) finish(false);
  }

  function finish(won) {
    done = true;
    guessInput.disabled = true;
    finalAttemptSec = Math.round((Date.now() - roundStartTs) / 1000);
    var improved = saveBestIfBetter(round.id, guesses.length, totalTiles);
    renderBestNote();
    setTimeout(function () { showEndModal(won, improved); }, 350);
  }

  function showEndModal(won, improved) {
    endEyebrow.textContent = won ? 'Solved it' : 'Out of guesses';
    endTitle.textContent = round.vehicle.year + ' ' + round.vehicle.make + ' ' + round.vehicle.model;
    endAnswer.textContent = won
      ? ('Got it in ' + guesses.length + '/' + maxGuesses + ' guesses.' + (improved ? ' New best!' : ''))
      : "That one got away — here's today's listing.";
    endGuesses.textContent = guesses.length + '/' + maxGuesses;
    endTiles.textContent = totalTiles + '/' + totalTiles;
    playerName.value = prefilledUsername();
    endBackdrop.hidden = false;
  }

  saveScoreForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = playerName.value.trim();
    rememberUsername(name);
    if (window.__GAME_JAM_SAVE_SCORE__) {
      window.__GAME_JAM_SAVE_SCORE__({
        gameId: 'reveal-the-deal',
        score: guesses.length,
        attemptLength: finalAttemptSec,
        username: name
      });
    }
    toast('Score saved');
  });

  endClose.addEventListener('click', function () { endBackdrop.hidden = true; });
  endCopy.addEventListener('click', function () {
    var won = guesses.length && isWin(guesses[guesses.length - 1]);
    var text = 'Reveal the Deal — ' + round.label + '\n' +
      (won ? (guesses.length + '/' + maxGuesses + ' guesses') : 'X/' + maxGuesses) + '\n' +
      totalTiles + '/' + totalTiles + ' tiles flipped';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); })
        .catch(function () { toast('Could not copy'); });
    } else {
      toast('Copy not supported here');
    }
  });

  // ---- tile rendering ----

  function renderTiles(revealCount) {
    for (var i = 0; i < tileGridEl.children.length; i++) {
      var gridPos = parseInt(tileGridEl.children[i].getAttribute('data-pos'), 10);
      var orderIdx = revealOrder.indexOf(gridPos);
      tileGridEl.children[i].classList.toggle('revealed', orderIdx !== -1 && orderIdx < revealCount);
    }
    statTiles.textContent = revealCount + '/' + totalTiles;
  }

  function buildTileGrid() {
    tileGridEl.innerHTML = '';
    for (var i = 0; i < totalTiles; i++) {
      var el = document.createElement('div');
      el.className = 'tile';
      el.setAttribute('data-pos', String(i));
      tileGridEl.appendChild(el);
    }
  }

  // ---- day strip & puzzle loading ----

  function renderDayStrip() {
    dayStripEl.innerHTML = '';
    rounds.forEach(function (r, i) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'day-pill' + (i === todayIndex ? ' today' : '') + (i === currentIndex ? ' active' : '');
      pill.textContent = DAY_TAGS[i] || ('#' + (i + 1));
      pill.title = r.label;
      pill.addEventListener('click', function () { loadPuzzle(i); });
      dayStripEl.appendChild(pill);
    });
  }

  function loadPuzzle(i) {
    currentIndex = i;
    round = rounds[i];
    guesses = [];
    done = false;
    roundStartTs = Date.now();
    guessInput.disabled = false;
    guessInput.value = '';
    currentSuggestions = [];
    highlightIndex = -1;
    renderSuggestions();
    endBackdrop.hidden = true;

    flavorEl.textContent = round.flavor || '';
    puzzleNumberEl.textContent = i === todayIndex ? ('Reveal the Deal #' + puzzleNumber) : 'Reveal the Deal · Practice';

    revealOrder = shuffled(
      Array.from({ length: totalTiles }, function (_, idx) { return idx; }),
      mulberry32(seedFromString(round.id))
    );

    var imageBase = window.__GAME_JAM_DATA_BASE__
      ? window.__GAME_JAM_DATA_BASE__ + '/reveal-the-deal/web/images/'
      : 'images/';
    revealImg.onerror = null;
    revealImg.src = imageBase + round.image;
    var placeholder = placeholderDataUri(round.id);
    revealImg.onerror = function () { revealImg.onerror = null; revealImg.src = placeholder; };

    buildTileGrid();
    renderTiles(0);
    renderDayStrip();
    renderBestNote();
  }

  function loadData(roundData, vehicleData) {
    rounds = roundData.rounds;
    tileCols = roundData.tileCols || 5;
    tileRows = roundData.tileRows || 4;
    maxGuesses = roundData.maxGuesses || 6;
    totalTiles = tileCols * tileRows;
    tileGridEl.style.gridTemplateColumns = 'repeat(' + tileCols + ', 1fr)';
    tileGridEl.style.gridTemplateRows = 'repeat(' + tileRows + ', 1fr)';
    statGuesses.textContent = '0/' + maxGuesses;
    statTiles.textContent = '0/' + totalTiles;

    vehicles = vehicleData.vehicles;

    var idx = daysSinceEpoch();
    todayIndex = idx % rounds.length;
    puzzleNumber = idx + 1;
    loadPuzzle(todayIndex);
  }

  // When embedded as an MFE, this script runs inside the host page, so a
  // relative fetch would resolve against the host's URL, not this game's
  // origin. window.__GAME_JAM_DATA_BASE__ is set by the host wrapper before
  // injecting this script; standalone mode leaves it unset.
  var dataBase = window.__GAME_JAM_DATA_BASE__
    ? window.__GAME_JAM_DATA_BASE__ + '/reveal-the-deal/data/'
    : '../data/';

  Promise.all([
    fetch(dataBase + 'rounds.json').then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); }),
    fetch(dataBase + 'vehicles.json').then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
  ])
    .then(function (results) { loadData(results[0], results[1]); })
    .catch(function () { loadData(FALLBACK_ROUNDS, { vehicles: FALLBACK_VEHICLES }); });
})();

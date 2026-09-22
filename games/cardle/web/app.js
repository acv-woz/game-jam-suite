(function () {
  'use strict';

  // Same pool as ../data/vehicles.json, embedded so the game still works
  // when index.html is opened directly (file://), where fetch() is
  // blocked. Keep this in sync with data/vehicles.json when editing the
  // pool — see Lot Jam's app.js for the same pattern.
  var FALLBACK_VEHICLES = [
    { make: "Toyota", model: "Camry", year: 2022, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Mainstream" },
    { make: "Toyota", model: "Corolla", year: 2021, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Economy" },
    { make: "Toyota", model: "RAV4", year: 2023, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Toyota", model: "Tacoma", year: 2020, body: "Truck", drive: "4WD", origin: "Japan", tier: "Mainstream" },
    { make: "Toyota", model: "Prius", year: 2019, body: "Hatchback", drive: "FWD", origin: "Japan", tier: "Economy" },
    { make: "Honda", model: "Civic", year: 2022, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Economy" },
    { make: "Honda", model: "Civic", year: 2015, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Economy" },
    { make: "Honda", model: "Accord", year: 2021, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Mainstream" },
    { make: "Honda", model: "CR-V", year: 2023, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Honda", model: "Odyssey", year: 2020, body: "Minivan", drive: "FWD", origin: "Japan", tier: "Mainstream" },
    { make: "Ford", model: "F-150", year: 2022, body: "Truck", drive: "4WD", origin: "USA", tier: "Mainstream" },
    { make: "Ford", model: "Mustang", year: 2021, body: "Coupe", drive: "RWD", origin: "USA", tier: "Premium" },
    { make: "Ford", model: "Explorer", year: 2020, body: "SUV", drive: "AWD", origin: "USA", tier: "Mainstream" },
    { make: "Ford", model: "Escape", year: 2019, body: "SUV", drive: "FWD", origin: "USA", tier: "Economy" },
    { make: "Ford", model: "Bronco", year: 2022, body: "SUV", drive: "4WD", origin: "USA", tier: "Premium" },
    { make: "Chevrolet", model: "Silverado", year: 2021, body: "Truck", drive: "4WD", origin: "USA", tier: "Mainstream" },
    { make: "Chevrolet", model: "Camaro", year: 2019, body: "Coupe", drive: "RWD", origin: "USA", tier: "Premium" },
    { make: "Chevrolet", model: "Equinox", year: 2022, body: "SUV", drive: "FWD", origin: "USA", tier: "Economy" },
    { make: "Chevrolet", model: "Corvette", year: 2023, body: "Coupe", drive: "RWD", origin: "USA", tier: "Luxury" },
    { make: "Chevrolet", model: "Tahoe", year: 2020, body: "SUV", drive: "4WD", origin: "USA", tier: "Premium" },
    { make: "Jeep", model: "Wrangler", year: 2021, body: "SUV", drive: "4WD", origin: "USA", tier: "Premium" },
    { make: "Jeep", model: "Grand Cherokee", year: 2022, body: "SUV", drive: "4WD", origin: "USA", tier: "Premium" },
    { make: "Jeep", model: "Cherokee", year: 2019, body: "SUV", drive: "AWD", origin: "USA", tier: "Mainstream" },
    { make: "Subaru", model: "Outback", year: 2022, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Subaru", model: "Forester", year: 2021, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Subaru", model: "WRX", year: 2020, body: "Sedan", drive: "AWD", origin: "Japan", tier: "Premium" },
    { make: "Nissan", model: "Altima", year: 2021, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Mainstream" },
    { make: "Nissan", model: "Rogue", year: 2022, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Nissan", model: "Frontier", year: 2020, body: "Truck", drive: "4WD", origin: "Japan", tier: "Mainstream" },
    { make: "Nissan", model: "Sentra", year: 2019, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Economy" },
    { make: "BMW", model: "3 Series", year: 2022, body: "Sedan", drive: "RWD", origin: "Germany", tier: "Premium" },
    { make: "BMW", model: "X5", year: 2021, body: "SUV", drive: "AWD", origin: "Germany", tier: "Luxury" },
    { make: "BMW", model: "5 Series", year: 2019, body: "Sedan", drive: "RWD", origin: "Germany", tier: "Luxury" },
    { make: "Mercedes-Benz", model: "C-Class", year: 2022, body: "Sedan", drive: "RWD", origin: "Germany", tier: "Premium" },
    { make: "Mercedes-Benz", model: "GLC", year: 2021, body: "SUV", drive: "AWD", origin: "Germany", tier: "Luxury" },
    { make: "Audi", model: "A4", year: 2022, body: "Sedan", drive: "AWD", origin: "Germany", tier: "Premium" },
    { make: "Audi", model: "Q5", year: 2020, body: "SUV", drive: "AWD", origin: "Germany", tier: "Luxury" },
    { make: "Volkswagen", model: "Jetta", year: 2021, body: "Sedan", drive: "FWD", origin: "Germany", tier: "Economy" },
    { make: "Volkswagen", model: "Tiguan", year: 2022, body: "SUV", drive: "AWD", origin: "Germany", tier: "Mainstream" },
    { make: "Volkswagen", model: "Golf GTI", year: 2019, body: "Hatchback", drive: "FWD", origin: "Germany", tier: "Premium" },
    { make: "Hyundai", model: "Elantra", year: 2022, body: "Sedan", drive: "FWD", origin: "South Korea", tier: "Economy" },
    { make: "Hyundai", model: "Tucson", year: 2021, body: "SUV", drive: "AWD", origin: "South Korea", tier: "Mainstream" },
    { make: "Hyundai", model: "Sonata", year: 2020, body: "Sedan", drive: "FWD", origin: "South Korea", tier: "Mainstream" },
    { make: "Kia", model: "Forte", year: 2022, body: "Sedan", drive: "FWD", origin: "South Korea", tier: "Economy" },
    { make: "Kia", model: "Telluride", year: 2021, body: "SUV", drive: "AWD", origin: "South Korea", tier: "Premium" },
    { make: "Kia", model: "Soul", year: 2019, body: "Hatchback", drive: "FWD", origin: "South Korea", tier: "Economy" },
    { make: "Mazda", model: "Mazda3", year: 2022, body: "Sedan", drive: "FWD", origin: "Japan", tier: "Mainstream" },
    { make: "Mazda", model: "CX-5", year: 2021, body: "SUV", drive: "AWD", origin: "Japan", tier: "Mainstream" },
    { make: "Tesla", model: "Model 3", year: 2022, body: "Sedan", drive: "AWD", origin: "USA", tier: "Premium" },
    { make: "Tesla", model: "Model Y", year: 2023, body: "SUV", drive: "AWD", origin: "USA", tier: "Premium" },
    { make: "Dodge", model: "Charger", year: 2020, body: "Sedan", drive: "RWD", origin: "USA", tier: "Premium" },
    { make: "Dodge", model: "Durango", year: 2021, body: "SUV", drive: "AWD", origin: "USA", tier: "Premium" },
    { make: "Ram", model: "1500", year: 2021, body: "Truck", drive: "4WD", origin: "USA", tier: "Mainstream" },
    { make: "GMC", model: "Sierra", year: 2022, body: "Truck", drive: "4WD", origin: "USA", tier: "Premium" },
    { make: "GMC", model: "Acadia", year: 2020, body: "SUV", drive: "AWD", origin: "USA", tier: "Mainstream" },
    { make: "Volvo", model: "XC90", year: 2021, body: "SUV", drive: "AWD", origin: "Sweden", tier: "Luxury" },
    { make: "Porsche", model: "911", year: 2020, body: "Coupe", drive: "RWD", origin: "Germany", tier: "Luxury" },
    { make: "Land Rover", model: "Range Rover", year: 2019, body: "SUV", drive: "4WD", origin: "UK", tier: "Luxury" }
  ];

  var COLUMNS = [
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'body', label: 'Body' },
    { key: 'drive', label: 'Drive' },
    { key: 'origin', label: 'Origin' }
  ];
  var MAX_GUESSES = 6;
  var EPOCH = Date.UTC(2026, 8, 14); // same arbitrary Monday reference used across the suite

  // ---- seeded RNG (mulberry32, seeded from an FNV-1a hash of the date string) ----
  // Same date string always picks the same target vehicle for every player.

  function seedFromString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
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

  function pickTargetForDate(dateStr, vehicles) {
    var rand = mulberry32(seedFromString(dateStr));
    return vehicles[Math.floor(rand() * vehicles.length)];
  }

  // ---- date helpers (all UTC, so everyone gets the same puzzle on the same day) ----

  var DAY_TAGS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var STRIP_DAYS = 7;

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function dateStrOf(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }
  function todayUTC() {
    var now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
  function daysSinceEpoch(dateStr) {
    return Math.floor((new Date(dateStr + 'T00:00:00Z').getTime() - EPOCH) / 86400000);
  }
  function addDays(dateStr, delta) {
    return dateStrOf(new Date(new Date(dateStr + 'T00:00:00Z').getTime() + delta * 86400000));
  }

  function vehicleKey(v) { return v.make + '|' + v.model + '|' + v.year; }

  // ---- DOM refs ----

  var puzzleNumberEl = document.getElementById('puzzleNumber');
  var statGuesses = document.getElementById('statGuesses');
  var statStreak = document.getElementById('statStreak');
  var dayStripEl = document.getElementById('dayStrip');
  var colLabelsEl = document.getElementById('colLabels');
  var gridEl = document.getElementById('grid');
  var guessForm = document.getElementById('guessForm');
  var guessInput = document.getElementById('guessInput');
  var suggestionsEl = document.getElementById('suggestions');
  var toastEl = document.getElementById('toast');
  var endBackdrop = document.getElementById('endBackdrop');
  var endEyebrow = document.getElementById('endEyebrow');
  var endTitle = document.getElementById('endTitle');
  var endAnswer = document.getElementById('endAnswer');
  var endGuesses = document.getElementById('endGuesses');
  var endStreak = document.getElementById('endStreak');
  var endClose = document.getElementById('endClose');
  var endCopy = document.getElementById('endCopy');
  var clueChipsEl = document.getElementById('clueChips');
  var toggleCandidatesBtn = document.getElementById('toggleCandidates');
  var candidateListEl = document.getElementById('candidateList');

  var vehicles = [];
  var todayStr = null;
  var currentDateStr = null;
  var target = null;
  var guesses = []; // array of vehicle objects, in order guessed
  var done = false;
  var highlightIndex = -1;
  var currentSuggestions = [];
  var toastTimer = null;

  colLabelsEl.innerHTML = COLUMNS.map(function (c) { return '<span>' + c.label + '</span>'; }).join('');

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  // ---- persistence ----

  function stateKey(dateStr) { return 'cardle-state-' + dateStr; }

  function loadState(dateStr) {
    try {
      var raw = localStorage.getItem(stateKey(dateStr));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveState(dateStr) {
    try {
      localStorage.setItem(stateKey(dateStr), JSON.stringify({
        guessKeys: guesses.map(vehicleKey),
        done: done
      }));
    } catch (e) { /* storage unavailable, skip silently */ }
  }

  function loadStreak() {
    try {
      var raw = localStorage.getItem('cardle-streak');
      return raw ? JSON.parse(raw) : { count: 0, lastDate: null };
    } catch (e) { return { count: 0, lastDate: null }; }
  }

  function updateStreakOnFinish(won) {
    if (currentDateStr !== todayStr) return loadStreak().count; // practice days don't affect the streak
    var streak = loadStreak();
    if (streak.lastDate === todayStr) return streak.count; // already recorded today
    var next = won && streak.lastDate === addDays(todayStr, -1) ? streak.count + 1 : (won ? 1 : 0);
    try {
      localStorage.setItem('cardle-streak', JSON.stringify({ count: next, lastDate: todayStr }));
    } catch (e) { /* storage unavailable */ }
    return next;
  }

  // ---- feedback ----

  function feedback(guess) {
    return COLUMNS.map(function (c) {
      if (c.key === 'year') {
        if (guess.year === target.year) return { ok: true, text: String(guess.year) };
        var arrow = guess.year < target.year ? '▲' : '▼';
        return { ok: false, text: guess.year + ' ' + arrow, arrow: arrow };
      }
      var ok = guess[c.key] === target[c.key];
      return { ok: ok, text: String(guess[c.key]) };
    });
  }

  function isWin(guess) { return vehicleKey(guess) === vehicleKey(target); }

  // ---- clues & candidates ----
  // Body/Drive/Origin/Tier are handed to the player up front instead of being
  // feedback-only. Without them the "alphabet" here is 58 arbitrary vehicles
  // nobody has memorized, so 6 blind guesses is closer to a memory test than
  // a word game — these four facts narrow it to ~3 candidates on average
  // (verified against the actual pool), which is what makes it solvable.
  var CLUE_KEYS = ['body', 'drive', 'origin', 'tier'];
  var CLUE_LABELS = { body: 'Body', drive: 'Drivetrain', origin: 'Origin', tier: 'Tier' };

  function candidatesForTarget() {
    return vehicles.filter(function (v) {
      return CLUE_KEYS.every(function (k) { return v[k] === target[k]; });
    });
  }

  function renderClues() {
    clueChipsEl.innerHTML = CLUE_KEYS.map(function (k) {
      return '<span class="clue-chip"><span class="k">' + CLUE_LABELS[k] + '</span>' + target[k] + '</span>';
    }).join('');
    renderCandidates();
  }

  function renderCandidates() {
    var already = guessedKeys();
    var list = candidatesForTarget().slice().sort(function (a, b) {
      return (a.make + a.model + a.year) < (b.make + b.model + b.year) ? -1 : 1;
    });
    candidateListEl.innerHTML = list.map(function (v) {
      var g = already.indexOf(vehicleKey(v)) !== -1;
      return '<li' + (g ? ' class="guessed"' : '') + '>' + v.make + ' ' + v.model + ' · ' + v.year + '</li>';
    }).join('');
    toggleCandidatesBtn.textContent = (candidateListEl.hidden ? 'Show' : 'Hide') + ' vehicles matching these clues (' + list.length + ')';
  }

  toggleCandidatesBtn.addEventListener('click', function () {
    candidateListEl.hidden = !candidateListEl.hidden;
    toggleCandidatesBtn.setAttribute('aria-expanded', candidateListEl.hidden ? 'false' : 'true');
    renderCandidates();
  });

  // ---- rendering ----

  function renderGrid() {
    var rows = guesses.map(function (g) {
      var fb = feedback(g);
      var cells = fb.map(function (f) {
        return '<div class="cell' + (f.ok ? ' match' : '') + '">' + f.text + '</div>';
      }).join('');
      return '<div class="guess-row">' + cells + '</div>';
    });
    for (var i = guesses.length; i < MAX_GUESSES; i++) {
      var blanks = COLUMNS.map(function () { return '<div class="cell">&nbsp;</div>'; }).join('');
      rows.push('<div class="empty-row">' + blanks + '</div>');
    }
    gridEl.innerHTML = rows.join('');
    statGuesses.textContent = guesses.length + '/' + MAX_GUESSES;
  }

  function renderStreak() {
    statStreak.textContent = String(loadStreak().count);
  }

  function renderDayStrip() {
    dayStripEl.innerHTML = '';
    var today = todayUTC();
    for (var i = STRIP_DAYS - 1; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      var dStr = dateStrOf(d);
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'day-pill' + (dStr === todayStr ? ' today' : '') + (dStr === currentDateStr ? ' active' : '');
      pill.textContent = DAY_TAGS[d.getUTCDay()];
      pill.title = dStr;
      pill.addEventListener('click', function (dateStr) {
        return function () { loadDate(dateStr); };
      }(dStr));
      dayStripEl.appendChild(pill);
    }
  }

  // ---- suggestions / guess input ----

  function guessedKeys() { return guesses.map(vehicleKey); }

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
    guessInput.value = '';
    currentSuggestions = [];
    highlightIndex = -1;
    renderSuggestions();
    renderGrid();
    renderCandidates();
    saveState(currentDateStr);

    if (isWin(vehicle)) {
      finish(true);
    } else if (guesses.length >= MAX_GUESSES) {
      finish(false);
    }
  }

  function finish(won) {
    done = true;
    guessInput.disabled = true;
    saveState(currentDateStr);
    var streakCount = updateStreakOnFinish(won);
    renderStreak();
    setTimeout(function () { showEndModal(won, streakCount); }, 250);
  }

  function showEndModal(won, streakCount) {
    var isToday = currentDateStr === todayStr;
    endEyebrow.textContent = won ? 'Solved it' : 'Out of guesses';
    endTitle.textContent = target.year + ' ' + target.make + ' ' + target.model;
    endAnswer.textContent = won
      ? ('Got it in ' + guesses.length + '/' + MAX_GUESSES + '.')
      : "That one got away — here's today's car.";
    if (!isToday) endEyebrow.textContent += ' (practice)';
    endGuesses.textContent = guesses.length + '/' + MAX_GUESSES;
    endStreak.textContent = String(streakCount);
    endBackdrop.hidden = false;
  }

  endClose.addEventListener('click', function () { endBackdrop.hidden = true; });
  endCopy.addEventListener('click', function () {
    var lines = guesses.map(function (g) {
      return feedback(g).map(function (f, i) {
        if (COLUMNS[i].key === 'year') return f.ok ? '✓' : ('✕' + f.arrow);
        return f.ok ? '✓' : '✕';
      }).join(' ');
    });
    var won = isWin(guesses[guesses.length - 1]);
    var text = 'Cardle #' + (daysSinceEpoch(todayStr) + 1) + ' — ' +
      (won ? (guesses.length + '/' + MAX_GUESSES) : 'X/' + MAX_GUESSES) + '\n' +
      '(Make Model Year Body Drive Origin)\n' + lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); })
        .catch(function () { toast('Could not copy'); });
    } else {
      toast('Copy not supported here');
    }
  });

  // ---- puzzle loading ----

  function loadDate(dateStr) {
    currentDateStr = dateStr;
    target = pickTargetForDate(dateStr, vehicles);
    guesses = [];
    done = false;
    guessInput.disabled = false;
    guessInput.value = '';
    currentSuggestions = [];
    highlightIndex = -1;
    renderSuggestions();
    endBackdrop.hidden = true;
    candidateListEl.hidden = true;
    toggleCandidatesBtn.setAttribute('aria-expanded', 'false');

    var saved = loadState(dateStr);
    if (saved && saved.guessKeys && saved.guessKeys.length) {
      var byKey = {};
      vehicles.forEach(function (v) { byKey[vehicleKey(v)] = v; });
      guesses = saved.guessKeys.map(function (k) { return byKey[k]; }).filter(Boolean);
      done = !!saved.done;
      if (done) guessInput.disabled = true;
    }

    var isToday = dateStr === todayStr;
    puzzleNumberEl.textContent = isToday
      ? ('Cardle #' + (daysSinceEpoch(todayStr) + 1))
      : ('Cardle · Practice ' + dateStr);

    renderDayStrip();
    renderClues();
    renderGrid();
    renderStreak();

    if (done && guesses.length) {
      var won = isWin(guesses[guesses.length - 1]);
      setTimeout(function () { showEndModal(won, loadStreak().count); }, 150);
    }
  }

  function loadVehicleData(data) {
    vehicles = data.vehicles;
    todayStr = dateStrOf(todayUTC());
    loadDate(todayStr);
  }

  // When embedded as an MFE, this script runs inside the host page, so a
  // relative fetch would resolve against the host's URL, not this game's
  // origin. window.__GAME_JAM_DATA_BASE__ is set by the host wrapper before
  // injecting this script; standalone mode leaves it unset.
  var vehiclesUrl = window.__GAME_JAM_DATA_BASE__
    ? window.__GAME_JAM_DATA_BASE__ + '/cardle/data/vehicles.json'
    : '../data/vehicles.json';

  fetch(vehiclesUrl)
    .then(function (r) { if (!r.ok) throw new Error('bad response'); return r.json(); })
    .then(loadVehicleData)
    .catch(function () { loadVehicleData({ vehicles: FALLBACK_VEHICLES }); });
})();

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
      html += '<a href="/game-jam/leaderboard?game=lot-jam" class="nav-lb">Leaderboard &rarr;</a>';
    }
    navEl.innerHTML = html;
  })();

  // Same puzzle set as ../data/puzzles.json, embedded so the game still
  // works when index.html is opened directly (file://), where fetch() is
  // blocked. Keep this in sync with data/puzzles.json when editing puzzles.
  var FALLBACK_PUZZLES = {
    "gridSize": 6,
    "puzzles": [
      { "id": "p1", "label": "Monday Warmup", "flavor": "One car in the way. Ease into it.", "par": 2,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a", "row": 2, "col": 2, "len": 2, "orient": "V" }
        ] },
      { "id": "p2", "label": "Tuesday Traffic", "flavor": "Two cars, two directions.", "par": 3,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a", "row": 2, "col": 2, "len": 2, "orient": "V" },
          { "id": "b", "row": 2, "col": 4, "len": 2, "orient": "V" }
        ] },
      { "id": "p3", "label": "Boxed In", "flavor": "Something's holding that first car in place.", "par": 4,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a", "row": 2, "col": 2, "len": 2, "orient": "V" },
          { "id": "c1", "row": 4, "col": 2, "len": 2, "orient": "H" },
          { "id": "d1", "row": 0, "col": 2, "len": 2, "orient": "H" },
          { "id": "b", "row": 2, "col": 4, "len": 2, "orient": "V" }
        ] },
      { "id": "p4", "label": "Rush Building", "flavor": "Now both lanes are pinned. Work out the order.", "par": 6,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a", "row": 2, "col": 2, "len": 2, "orient": "V" },
          { "id": "c1", "row": 4, "col": 2, "len": 2, "orient": "H" },
          { "id": "d1", "row": 0, "col": 2, "len": 2, "orient": "H" },
          { "id": "b", "row": 2, "col": 4, "len": 2, "orient": "V" },
          { "id": "c2", "row": 4, "col": 4, "len": 2, "orient": "H" },
          { "id": "d2", "row": 0, "col": 4, "len": 2, "orient": "H" }
        ] },
      { "id": "p5", "label": "Rush Hour", "flavor": "Every lane ahead is full. Nothing moves until something else does.", "par": 8,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a2", "row": 2, "col": 2, "len": 2, "orient": "V" },
          { "id": "a3", "row": 2, "col": 3, "len": 2, "orient": "V" },
          { "id": "b2", "row": 2, "col": 4, "len": 2, "orient": "V" },
          { "id": "b3", "row": 2, "col": 5, "len": 2, "orient": "V" },
          { "id": "c1", "row": 4, "col": 2, "len": 2, "orient": "H" },
          { "id": "c2", "row": 4, "col": 4, "len": 2, "orient": "H" },
          { "id": "d1", "row": 0, "col": 2, "len": 2, "orient": "H" },
          { "id": "d2", "row": 0, "col": 4, "len": 2, "orient": "H" }
        ] },
      { "id": "p6", "label": "Gridlock", "flavor": "The whole lot is jammed. Find the one car that unlocks everything else.", "par": 10,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a2", "row": 2, "col": 2, "len": 2, "orient": "V" },
          { "id": "a3", "row": 2, "col": 3, "len": 2, "orient": "V" },
          { "id": "b2", "row": 2, "col": 4, "len": 2, "orient": "V" },
          { "id": "b3", "row": 2, "col": 5, "len": 2, "orient": "V" },
          { "id": "c1", "row": 4, "col": 2, "len": 2, "orient": "H" },
          { "id": "c2", "row": 4, "col": 4, "len": 2, "orient": "H" },
          { "id": "d1", "row": 0, "col": 2, "len": 2, "orient": "H" },
          { "id": "d2", "row": 0, "col": 4, "len": 2, "orient": "H" },
          { "id": "e1", "row": 4, "col": 0, "len": 2, "orient": "V" }
        ] },
      { "id": "p7", "label": "Easy Like Sunday Morning", "flavor": "A lighter one to close out the week.", "par": 3,
        "vehicles": [
          { "id": "target", "row": 2, "col": 0, "len": 2, "orient": "H", "isTarget": true },
          { "id": "a", "row": 2, "col": 3, "len": 2, "orient": "V" },
          { "id": "b", "row": 2, "col": 5, "len": 2, "orient": "V" }
        ] }
    ]
  };

  var VEHICLE_COLORS = ['var(--v-slate)', 'var(--v-violet)', 'var(--v-blue)', 'var(--v-brick)', 'var(--v-green)'];
  var EPOCH = Date.UTC(2026, 8, 14); // arbitrary Monday reference for daily numbering
  var DAY_TAGS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  var boardEl = document.getElementById('board');
  var exitMarkerEl = document.getElementById('exitMarker');
  var dayStripEl = document.getElementById('dayStrip');
  var flavorEl = document.getElementById('flavorText');
  var puzzleNumberEl = document.getElementById('puzzleNumber');
  var statMoves = document.getElementById('statMoves');
  var statPar = document.getElementById('statPar');
  var statTime = document.getElementById('statTime');
  var bestNoteEl = document.getElementById('bestNote');
  var undoBtn = document.getElementById('undoBtn');
  var resetBtn = document.getElementById('resetBtn');
  var toastEl = document.getElementById('toast');
  var winBackdrop = document.getElementById('winBackdrop');
  var winTitle = document.getElementById('winTitle');
  var winMoves = document.getElementById('winMoves');
  var winPar = document.getElementById('winPar');
  var winTime = document.getElementById('winTime');
  var winRank = document.getElementById('winRank');
  var winClose = document.getElementById('winClose');
  var winCopy = document.getElementById('winCopy');

  var GRID = 6;
  var CELL = 60;
  var puzzles = [];
  var todayIndex = 0;
  var puzzleNumber = 1;
  var currentIndex = 0;
  var vehicles = [];
  var originalVehicles = [];
  var history = [];
  var moveCount = 0;
  var solved = false;
  var timerStartTs = null;
  var timerInterval = null;
  var elapsedMs = 0;
  var finalElapsedMs = 0;
  var toastTimer = null;

  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function deepClone(vs) { return vs.map(function (v) { return Object.assign({}, v); }); }

  function occupancyExcluding(vs, excludeId) {
    var set = new Set();
    vs.forEach(function (v) {
      if (v.id === excludeId) return;
      for (var i = 0; i < v.len; i++) {
        var r = v.orient === 'V' ? v.row + i : v.row;
        var c = v.orient === 'H' ? v.col + i : v.col;
        set.add(r + ',' + c);
      }
    });
    return set;
  }

  function fits(v, start, occ) {
    for (var i = 0; i < v.len; i++) {
      var r = v.orient === 'V' ? start + i : v.row;
      var c = v.orient === 'H' ? start + i : v.col;
      if (r < 0 || c < 0 || r >= GRID || c >= GRID) return false;
      if (occ.has(r + ',' + c)) return false;
    }
    return true;
  }

  function freeRange(v) {
    var occ = occupancyExcluding(vehicles, v.id);
    var current = v.orient === 'H' ? v.col : v.row;
    var min = current, max = current;
    for (var p = current - 1; p >= 0; p--) { if (fits(v, p, occ)) min = p; else break; }
    var upperBound = GRID - v.len;
    for (var q = current + 1; q <= upperBound; q++) { if (fits(v, q, occ)) max = q; else break; }
    return { min: min, max: max, current: current };
  }

  function isSolved(vs) {
    var t = vs.filter(function (v) { return v.isTarget; })[0];
    return t.col + t.len - 1 === GRID - 1;
  }

  function targetRow(vs) {
    return vs.filter(function (v) { return v.isTarget; })[0].row;
  }

  // ---- puzzle loading ----

  function daysSinceEpoch() {
    return Math.max(0, Math.floor((Date.now() - EPOCH) / 86400000));
  }

  function loadPuzzleData(data) {
    puzzles = data.puzzles;
    GRID = data.gridSize || 6;
    var idx = daysSinceEpoch();
    todayIndex = idx % puzzles.length;
    puzzleNumber = idx + 1;
    renderDayStrip();
    loadPuzzle(todayIndex);
  }

  function loadPuzzle(i) {
    currentIndex = i;
    var puzzle = puzzles[i];
    vehicles = deepClone(puzzle.vehicles);
    originalVehicles = deepClone(puzzle.vehicles);
    history = [];
    moveCount = 0;
    solved = false;
    elapsedMs = 0;
    clearInterval(timerInterval);
    timerInterval = null;
    timerStartTs = null;

    flavorEl.textContent = puzzle.flavor || '';
    statMoves.textContent = '0';
    statPar.textContent = puzzle.par;
    statTime.textContent = '0:00';
    puzzleNumberEl.textContent = i === todayIndex ? ('Lot Jam #' + puzzleNumber) : 'Lot Jam · Practice';
    renderBestNote();
    renderDayStrip();
    computeCellSize();
    renderBoard();
  }

  function renderDayStrip() {
    dayStripEl.innerHTML = '';
    puzzles.forEach(function (p, i) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'day-pill' + (i === todayIndex ? ' today' : '') + (i === currentIndex ? ' active' : '');
      pill.textContent = (DAY_TAGS[i] || ('#' + (i + 1)));
      pill.title = p.label;
      pill.addEventListener('click', function () { loadPuzzle(i); });
      dayStripEl.appendChild(pill);
    });
  }

  function bestKey(puzzleId) { return 'lotjam-best-' + puzzleId; }

  function renderBestNote() {
    var puzzle = puzzles[currentIndex];
    var best = null;
    try { var raw = localStorage.getItem(bestKey(puzzle.id)); if (raw) best = JSON.parse(raw); } catch (e) {}
    bestNoteEl.textContent = best ? ('Best: ' + best.moves + ' moves') : 'No best yet';
  }

  function saveBestIfBetter(puzzleId, moves) {
    try {
      var raw = localStorage.getItem(bestKey(puzzleId));
      var best = raw ? JSON.parse(raw) : null;
      if (!best || moves < best.moves) {
        localStorage.setItem(bestKey(puzzleId), JSON.stringify({ moves: moves }));
      }
    } catch (e) { /* storage unavailable, skip silently */ }
  }

  // ---- rendering ----

  function computeCellSize() {
    var shellWidth = boardEl.parentElement.clientWidth || 340;
    CELL = Math.max(40, Math.min(64, Math.floor(shellWidth / GRID)));
  }

  function renderBoard() {
    Array.prototype.slice.call(boardEl.querySelectorAll('.vehicle')).forEach(function (el) { el.remove(); });

    boardEl.style.width = (CELL * GRID) + 'px';
    boardEl.style.height = (CELL * GRID) + 'px';
    boardEl.style.setProperty('--cell', CELL + 'px');

    var tRow = targetRow(vehicles);
    exitMarkerEl.style.top = (tRow * CELL) + 'px';
    exitMarkerEl.style.height = CELL + 'px';
    exitMarkerEl.style.left = (GRID * CELL) + 'px';
    exitMarkerEl.style.width = '16px';

    var colorIdx = 0;
    vehicles.forEach(function (v) {
      var el = document.createElement('div');
      el.className = 'vehicle' + (v.isTarget ? ' target' : '');
      positionVehicleEl(el, v);
      if (!v.isTarget) {
        el.style.background = VEHICLE_COLORS[colorIdx % VEHICLE_COLORS.length];
        colorIdx++;
      } else {
        var lights1 = document.createElement('span');
        lights1.className = 'lights';
        lights1.style.right = '3px';
        lights1.style.top = '4px';
        var lights2 = document.createElement('span');
        lights2.className = 'lights';
        lights2.style.right = '3px';
        lights2.style.bottom = '4px';
        el.appendChild(lights1);
        el.appendChild(lights2);
      }
      el.addEventListener('pointerdown', function (e) { onPointerDown(e, v, el); });
      boardEl.appendChild(el);
    });
  }

  var INSET = 4;

  function positionVehicleEl(el, v, overrideMainAxisPx) {
    var left, top, width, height;
    if (v.orient === 'H') {
      var leftPx = overrideMainAxisPx != null ? overrideMainAxisPx : v.col * CELL;
      left = leftPx + INSET;
      top = v.row * CELL + INSET;
      width = v.len * CELL - INSET * 2;
      height = CELL - INSET * 2;
    } else {
      var topPx = overrideMainAxisPx != null ? overrideMainAxisPx : v.row * CELL;
      left = v.col * CELL + INSET;
      top = topPx + INSET;
      width = CELL - INSET * 2;
      height = v.len * CELL - INSET * 2;
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.width = width + 'px';
    el.style.height = height + 'px';
  }

  // ---- drag interaction ----

  var drag = null;

  function onPointerDown(e, v, el) {
    if (solved) return;
    startTimerIfNeeded();
    el.setPointerCapture(e.pointerId);
    var range = freeRange(v);
    drag = {
      v: v,
      el: el,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      current: range.current,
      min: range.min,
      max: range.max
    };
    el.classList.add('dragging');
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    var deltaPx = drag.v.orient === 'H' ? (e.clientX - drag.startClientX) : (e.clientY - drag.startClientY);
    var deltaCells = deltaPx / CELL;
    var floatPos = drag.current + deltaCells;
    var clamped = Math.max(drag.min, Math.min(drag.max, floatPos));
    positionVehicleEl(drag.el, drag.v, clamped * CELL);
  }

  function onPointerUp(e) {
    if (!drag) return;
    var d = drag;
    d.el.removeEventListener('pointermove', onPointerMove);
    d.el.removeEventListener('pointerup', onPointerUp);
    d.el.removeEventListener('pointercancel', onPointerUp);
    d.el.classList.remove('dragging');
    try { d.el.releasePointerCapture(d.pointerId); } catch (err) {}

    var deltaPx = d.v.orient === 'H' ? (e.clientX - d.startClientX) : (e.clientY - d.startClientY);
    var deltaCells = deltaPx / CELL;
    var floatPos = d.current + deltaCells;
    var snapped = Math.round(Math.max(d.min, Math.min(d.max, floatPos)));

    drag = null;

    if (snapped !== d.current) {
      history.push(deepClone(vehicles));
      var v = vehicles.filter(function (x) { return x.id === d.v.id; })[0];
      if (v.orient === 'H') v.col = snapped; else v.row = snapped;
      moveCount++;
      statMoves.textContent = String(moveCount);
      if (isSolved(vehicles)) {
        handleSolved();
        return;
      }
    }
    renderBoard();
  }

  function startTimerIfNeeded() {
    if (timerStartTs || solved) return;
    timerStartTs = Date.now();
    timerInterval = setInterval(function () {
      elapsedMs = Date.now() - timerStartTs;
      statTime.textContent = fmtTime(elapsedMs);
    }, 250);
  }

  function handleSolved() {
    solved = true;
    clearInterval(timerInterval);
    timerInterval = null;
    finalElapsedMs = elapsedMs;
    renderBoard();
    var target = vehicles.filter(function (v) { return v.isTarget; })[0];
    var el = boardEl.querySelector('.vehicle.target');
    if (el) {
      requestAnimationFrame(function () {
        el.style.transition = 'left .35s ease';
        el.style.left = ((GRID + 1) * CELL) + 'px';
      });
    }
    var puzzle = puzzles[currentIndex];
    saveBestIfBetter(puzzle.id, moveCount);
    setTimeout(showWinModal, 420);
  }

  function rankFor(moves, par) {
    if (moves <= par) return 'Flawless Parking Job';
    if (moves <= par * 1.5) return 'Smooth Operator';
    if (moves <= par * 2.5) return 'Bumper to Bumper';
    return 'Total Gridlock';
  }

  function showWinModal() {
    var puzzle = puzzles[currentIndex];
    winTitle.textContent = puzzle.label;
    winMoves.textContent = String(moveCount);
    winPar.textContent = String(puzzle.par);
    winTime.textContent = fmtTime(finalElapsedMs);
    winRank.textContent = rankFor(moveCount, puzzle.par);
    winBackdrop.hidden = false;
    renderBestNote();
  }

  winClose.addEventListener('click', function () { winBackdrop.hidden = true; solved = false; });
  winCopy.addEventListener('click', function () {
    var puzzle = puzzles[currentIndex];
    var text = 'Lot Jam — ' + puzzle.label + '\n' +
      moveCount + ' moves (par ' + puzzle.par + ') in ' + fmtTime(finalElapsedMs) + '\n' +
      rankFor(moveCount, puzzle.par);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); })
        .catch(function () { toast('Could not copy'); });
    } else {
      toast('Copy not supported here');
    }
  });

  undoBtn.addEventListener('click', function () {
    if (solved || !history.length) return;
    vehicles = history.pop();
    moveCount = Math.max(0, moveCount - 1);
    statMoves.textContent = String(moveCount);
    renderBoard();
  });

  resetBtn.addEventListener('click', function () {
    if (solved) return;
    vehicles = deepClone(originalVehicles);
    history = [];
    moveCount = 0;
    elapsedMs = 0;
    timerStartTs = null;
    clearInterval(timerInterval);
    timerInterval = null;
    statMoves.textContent = '0';
    statTime.textContent = '0:00';
    renderBoard();
  });

  window.addEventListener('resize', function () {
    computeCellSize();
    renderBoard();
  });

  // When embedded as an MFE, this script runs inside the host page, so a
  // relative fetch would resolve against the host's URL, not this game's
  // origin. window.__GAME_JAM_DATA_BASE__ is set by the host wrapper before
  // injecting this script; standalone mode leaves it unset.
  var puzzlesUrl = window.__GAME_JAM_DATA_BASE__
    ? window.__GAME_JAM_DATA_BASE__ + '/lot-jam/data/puzzles.json'
    : '../data/puzzles.json';

  fetch(puzzlesUrl)
    .then(function (r) { if (!r.ok) throw new Error('bad response'); return r.json(); })
    .then(loadPuzzleData)
    .catch(function () { loadPuzzleData(FALLBACK_PUZZLES); });
})();

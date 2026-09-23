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
      html += '<a href="/game-jam/leaderboard?game=route-runner" class="nav-lb">Leaderboard &rarr;</a>';
    }
    navEl.innerHTML = html;
  })();

  var EPOCH = Date.UTC(2026, 8, 14); // same arbitrary Monday reference used by Lot Jam's numbering
  var DAY_TAGS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var STRIP_DAYS = 7;

  var boardEl = document.getElementById('board');
  var pathSvgEl = document.getElementById('pathSvg');
  var pathLineEl = document.getElementById('pathLine');
  var dayStripEl = document.getElementById('dayStrip');
  var flavorEl = document.getElementById('flavorText');
  var puzzleNumberEl = document.getElementById('puzzleNumber');
  var statStops = document.getElementById('statStops');
  var statCells = document.getElementById('statCells');
  var statTime = document.getElementById('statTime');
  var bestNoteEl = document.getElementById('bestNote');
  var undoBtn = document.getElementById('undoBtn');
  var resetBtn = document.getElementById('resetBtn');
  var toastEl = document.getElementById('toast');
  var winBackdrop = document.getElementById('winBackdrop');
  var winTitle = document.getElementById('winTitle');
  var winTime = document.getElementById('winTime');
  var winStops = document.getElementById('winStops');
  var bonusNoRetraceEl = document.getElementById('bonusNoRetrace');
  var bonusNoLiftEl = document.getElementById('bonusNoLift');
  var winClose = document.getElementById('winClose');
  var winCopy = document.getElementById('winCopy');
  var saveScoreForm = document.getElementById('saveScoreForm');
  var playerName = document.getElementById('playerName');
  var btnSaveScore = document.getElementById('btnSaveScore');

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

  var CELL = 60;
  var todayStr = null;
  var currentDateStr = null;
  var puzzle = null;
  var checkpointByCell = {};
  var maxCheckpointCell = -1;
  var startCell = -1;
  var cellEls = [];
  var pathCells = [];
  var solved = false;
  var scoreSaved = false;
  var dragActive = false;
  var timerStartTs = null;
  var timerInterval = null;
  var elapsedMs = 0;
  var finalElapsedMs = 0;
  var toastTimer = null;

  // Bonus tracking for a solve attempt — recorded alongside the time so a
  // future leaderboard can break ties between equal times: a route drawn
  // with no backtracking, and/or one continuous drag with no re-presses,
  // both rank above the same time achieved messily.
  var hadRetrace = false;
  var pointerDownCount = 0;
  var finalNoRetrace = false;
  var finalNoLift = false;

  // ---- date helpers (all UTC, so everyone gets the same puzzle on the same day) ----

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function dateStrOf(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }

  function todayUTC() {
    var now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  function daysSinceEpoch(dateStr) {
    return Math.floor((new Date(dateStr + 'T00:00:00Z').getTime() - EPOCH) / 86400000);
  }

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

  // ---- puzzle loading ----

  function cellIdx(r, c) { return r * puzzle.size + c; }

  function loadDate(dateStr) {
    currentDateStr = dateStr;
    puzzle = window.RouteRunnerGen.generatePuzzle(dateStr);

    checkpointByCell = {};
    puzzle.checkpoints.forEach(function (cp) {
      checkpointByCell[cellIdx(cp.row, cp.col)] = cp;
    });
    startCell = cellIdx(puzzle.checkpoints[0].row, puzzle.checkpoints[0].col);
    maxCheckpointCell = cellIdx(
      puzzle.checkpoints[puzzle.checkpoints.length - 1].row,
      puzzle.checkpoints[puzzle.checkpoints.length - 1].col
    );

    pathCells = [];
    elapsedMs = 0;
    hadRetrace = false;
    pointerDownCount = 0;
    scoreSaved = false;
    playerName.disabled = false;
    btnSaveScore.disabled = false;
    btnSaveScore.textContent = 'Save Score';
    clearInterval(timerInterval);
    timerInterval = null;
    timerStartTs = null;

    var isToday = dateStr === todayStr;
    puzzleNumberEl.textContent = isToday
      ? ('Route Runner #' + (daysSinceEpoch(todayStr) + 1))
      : ('Route Runner · Practice ' + dateStr);
    flavorEl.textContent = puzzle.size === 6
      ? 'Six-by-six challenge day — more tiles, more stops.'
      : 'Standard five-by-five route.';

    // Each date can only be solved once, ever (per browser) — revisiting an
    // already-solved date shows the recorded result instead of a fresh board.
    var record = renderResultNote();
    solved = !!record;
    undoBtn.disabled = solved;
    resetBtn.disabled = solved;
    var total = puzzle.size * puzzle.size;
    if (record) {
      statCells.textContent = total + '/' + total;
      statStops.textContent = puzzle.checkpoints.length + '/' + puzzle.checkpoints.length;
      statTime.textContent = fmtTime(record.ms);
    } else {
      statCells.textContent = '0/' + total;
      statStops.textContent = '0/' + puzzle.checkpoints.length;
      statTime.textContent = '0:00';
    }

    renderDayStrip();
    computeCellSize();
    renderBoard();
    renderPath();
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

  // Each date can only be solved once, so this is a write-once record, not a
  // "best across attempts" — it's what actually happened, permanently.
  function resultKey(dateStr) { return 'routerunner-result-' + dateStr; }

  function loadResult(dateStr) {
    try {
      var raw = localStorage.getItem(resultKey(dateStr));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; /* storage unavailable */ }
  }

  // A compact, always-both-shown token per bonus, used wherever there isn't
  // room for the full checkmark/X bonus-list UI (the win modal has that).
  function bonusTokens(record) {
    return [
      (record.noRetrace ? '✓' : '✕') + ' clean route',
      (record.noLift ? '✓' : '✕') + ' one continuous drag'
    ];
  }

  function renderResultNote() {
    var record = loadResult(currentDateStr);
    if (!record) {
      bestNoteEl.textContent = '';
      return null;
    }
    var bits = [fmtTime(record.ms)].concat(bonusTokens(record));
    bestNoteEl.textContent = 'Solved · ' + bits.join(' · ');
    return record;
  }

  function saveResultOnce(dateStr, record) {
    if (loadResult(dateStr)) return; // already solved; never overwrite
    try {
      localStorage.setItem(resultKey(dateStr), JSON.stringify(record));
    } catch (e) { /* storage unavailable, skip silently */ }
  }

  // ---- board rendering ----

  function computeCellSize() {
    var shellWidth = boardEl.parentElement.clientWidth || 340;
    CELL = Math.max(40, Math.min(64, Math.floor(shellWidth / puzzle.size)));
  }

  function renderBoard() {
    Array.prototype.slice.call(boardEl.querySelectorAll('.cell')).forEach(function (el) { el.remove(); });
    cellEls = [];

    var px = CELL * puzzle.size;
    boardEl.style.width = px + 'px';
    boardEl.style.height = px + 'px';
    boardEl.style.setProperty('--cell', CELL + 'px');
    pathSvgEl.setAttribute('width', px);
    pathSvgEl.setAttribute('height', px);

    for (var r = 0; r < puzzle.size; r++) {
      for (var c = 0; c < puzzle.size; c++) {
        var idx = cellIdx(r, c);
        var el = document.createElement('div');
        el.className = 'cell';
        el.style.left = (c * CELL) + 'px';
        el.style.top = (r * CELL) + 'px';
        el.style.width = CELL + 'px';
        el.style.height = CELL + 'px';
        var cp = checkpointByCell[idx];
        if (cp) {
          var num = document.createElement('span');
          num.className = 'stop-num';
          num.textContent = String(cp.number);
          el.appendChild(num);
        }
        if (idx === startCell) el.classList.add('stop-start');
        if (idx === maxCheckpointCell) el.classList.add('stop-end');
        boardEl.insertBefore(el, pathSvgEl);
        cellEls[idx] = el;
      }
    }
  }

  function renderPath() {
    for (var i = 0; i < cellEls.length; i++) {
      if (cellEls[i]) cellEls[i].classList.remove('filled', 'head');
    }
    pathCells.forEach(function (idx, i) {
      cellEls[idx].classList.add('filled');
      if (i === pathCells.length - 1) cellEls[idx].classList.add('head');
    });

    var pts = pathCells.map(function (idx) {
      var r = Math.floor(idx / puzzle.size), c = idx % puzzle.size;
      return (c * CELL + CELL / 2) + ',' + (r * CELL + CELL / 2);
    }).join(' ');
    pathLineEl.setAttribute('points', pts);

    var startEl = cellEls[startCell];
    if (startEl) startEl.classList.toggle('invite', !pathCells.length && !solved);
  }

  function flashStartHint() {
    var el = cellEls[startCell];
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // restart the animation even if it's already mid-run
    el.classList.add('shake');
  }

  // ---- route rules ----
  // Numbers must be hit in ascending order and the route has to start on stop 1
  // and finish exactly on the highest stop; unnumbered tiles never block a move.

  function isAdjacent(a, b) {
    var n = puzzle.size;
    var ra = Math.floor(a / n), ca = a % n, rb = Math.floor(b / n), cb = b % n;
    return (Math.abs(ra - rb) + Math.abs(ca - cb)) === 1;
  }

  function highestCheckpointVisited() {
    var max = 0;
    for (var i = 0; i < pathCells.length; i++) {
      var cp = checkpointByCell[pathCells[i]];
      if (cp && cp.number > max) max = cp.number;
    }
    return max;
  }

  function canExtendTo(idx) {
    if (pathCells.indexOf(idx) !== -1) return false;
    var cp = checkpointByCell[idx];
    if (!cp) return true;
    return cp.number === highestCheckpointVisited() + 1;
  }

  function tryExtendTo(idx) {
    if (!pathCells.length) {
      var cp = checkpointByCell[idx];
      if (cp && cp.number === 1) { pathCells.push(idx); return true; }
      return false;
    }
    var last = pathCells[pathCells.length - 1];
    if (idx === last) return false;
    if (pathCells.length > 1 && idx === pathCells[pathCells.length - 2]) {
      pathCells.pop();
      hadRetrace = true;
      return true;
    }
    if (!isAdjacent(last, idx)) return false;
    if (!canExtendTo(idx)) return false;
    pathCells.push(idx);
    return true;
  }

  function stepToward(targetIdx) {
    var guard = 0;
    while (guard++ < 200) {
      if (!pathCells.length) { tryExtendTo(targetIdx); return; }
      var last = pathCells[pathCells.length - 1];
      if (last === targetIdx) return;
      if (pathCells.length > 1 && pathCells[pathCells.length - 2] === targetIdx) { tryExtendTo(targetIdx); return; }
      if (isAdjacent(last, targetIdx)) { tryExtendTo(targetIdx); return; }

      var n = puzzle.size;
      var lr = Math.floor(last / n), lc = last % n, tr = Math.floor(targetIdx / n), tc = targetIdx % n;
      var stepIdx = null;
      if (Math.abs(lr - tr) >= Math.abs(lc - tc) && lr !== tr) {
        stepIdx = cellIdx(lr + (tr > lr ? 1 : -1), lc);
      } else if (lc !== tc) {
        stepIdx = cellIdx(lr, lc + (tc > lc ? 1 : -1));
      } else if (lr !== tr) {
        stepIdx = cellIdx(lr + (tr > lr ? 1 : -1), lc);
      }
      if (stepIdx === null || !tryExtendTo(stepIdx)) return; // blocked; stop where the line legally can
    }
  }

  function cellFromEvent(e) {
    var rect = boardEl.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
    var c = Math.min(puzzle.size - 1, Math.max(0, Math.floor(x / CELL)));
    var r = Math.min(puzzle.size - 1, Math.max(0, Math.floor(y / CELL)));
    return cellIdx(r, c);
  }

  // ---- game loop ----

  function startTimerIfNeeded() {
    if (timerStartTs || solved) return;
    timerStartTs = Date.now();
    timerInterval = setInterval(function () {
      elapsedMs = Date.now() - timerStartTs;
      statTime.textContent = fmtTime(elapsedMs);
    }, 250);
  }

  function updateAfterPathChange() {
    renderPath();
    var total = puzzle.size * puzzle.size;
    statCells.textContent = pathCells.length + '/' + total;
    statStops.textContent = highestCheckpointVisited() + '/' + puzzle.checkpoints.length;
    checkWin();
  }

  function checkWin() {
    if (solved) return;
    var total = puzzle.size * puzzle.size;
    if (pathCells.length !== total) return;
    var lastIdx = pathCells[pathCells.length - 1];
    if (lastIdx !== maxCheckpointCell) {
      toast('Every tile is full, but you have to finish on the last stop — Undo and reroute.');
      return;
    }
    handleSolved();
  }

  function handleSolved() {
    solved = true;
    undoBtn.disabled = true;
    resetBtn.disabled = true;
    clearInterval(timerInterval);
    timerInterval = null;
    finalElapsedMs = elapsedMs;
    finalNoRetrace = !hadRetrace;
    finalNoLift = pointerDownCount === 1;
    saveResultOnce(currentDateStr, { ms: finalElapsedMs, noRetrace: finalNoRetrace, noLift: finalNoLift });
    setTimeout(showWinModal, 200);
  }

  function setBonusItem(el, achieved) {
    el.classList.toggle('achieved', achieved);
    el.classList.toggle('missed', !achieved);
  }

  function showWinModal() {
    var isToday = currentDateStr === todayStr;
    winTitle.textContent = (puzzle.size + '×' + puzzle.size) + ' route cleared';
    winTime.textContent = fmtTime(finalElapsedMs);
    winStops.textContent = String(puzzle.checkpoints.length);
    setBonusItem(bonusNoRetraceEl, finalNoRetrace);
    setBonusItem(bonusNoLiftEl, finalNoLift);
    if (!isToday) winTitle.textContent += ' (practice)';
    playerName.value = prefilledUsername();
    winBackdrop.hidden = false;
    renderResultNote();
  }

  saveScoreForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (scoreSaved) return;
    var name = playerName.value.trim();
    rememberUsername(name);
    if (window.__GAME_JAM_SAVE_SCORE__) {
      var attemptSec = Math.round(finalElapsedMs / 1000);
      window.__GAME_JAM_SAVE_SCORE__({
        gameId: 'route-runner',
        score: attemptSec,
        attemptLength: attemptSec,
        username: name
      });
    }
    scoreSaved = true;
    playerName.disabled = true;
    btnSaveScore.disabled = true;
    btnSaveScore.textContent = 'Saved';
    toast('Score saved');
  });

  winClose.addEventListener('click', function () { winBackdrop.hidden = true; });
  winCopy.addEventListener('click', function () {
    var bits = bonusTokens({ noRetrace: finalNoRetrace, noLift: finalNoLift });
    var text = 'Route Runner — ' + currentDateStr + ' (' + puzzle.size + '×' + puzzle.size + ')\n' +
      'Solved in ' + fmtTime(finalElapsedMs) + '\n' +
      bits.join(' · ') + '\n' +
      puzzle.checkpoints.length + ' stops, ' + (puzzle.size * puzzle.size) + '/' + (puzzle.size * puzzle.size) + ' tiles';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); })
        .catch(function () { toast('Could not copy'); });
    } else {
      toast('Copy not supported here');
    }
  });

  undoBtn.addEventListener('click', function () {
    if (solved || !pathCells.length) return;
    pathCells.pop();
    hadRetrace = true;
    updateAfterPathChange();
  });

  resetBtn.addEventListener('click', function () {
    if (solved) return;
    pathCells = [];
    elapsedMs = 0;
    hadRetrace = false;
    pointerDownCount = 0;
    timerStartTs = null;
    clearInterval(timerInterval);
    timerInterval = null;
    statTime.textContent = '0:00';
    updateAfterPathChange();
  });

  boardEl.addEventListener('pointerdown', function (e) {
    if (solved) return;
    var idx = cellFromEvent(e);
    if (idx === null) return;
    if (e.cancelable) e.preventDefault(); // stop native text/drag selection on the number labels from hijacking the gesture
    startTimerIfNeeded();
    try { boardEl.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    dragActive = true;
    pointerDownCount++;

    if (!pathCells.length) {
      if (!tryExtendTo(idx)) {
        toast('Start your route at stop 1 — the pulsing tile.');
        flashStartHint();
      }
    } else {
      var existingAt = pathCells.indexOf(idx);
      if (existingAt !== -1) {
        if (existingAt < pathCells.length - 1) hadRetrace = true; // re-pressing the head itself isn't a retrace
        pathCells = pathCells.slice(0, existingAt + 1);
      } else if (isAdjacent(pathCells[pathCells.length - 1], idx)) {
        tryExtendTo(idx);
      }
    }
    updateAfterPathChange();
  });

  boardEl.addEventListener('pointermove', function (e) {
    if (!dragActive || solved) return;
    var idx = cellFromEvent(e);
    if (idx === null) return;
    stepToward(idx);
    updateAfterPathChange();
  });

  function endDrag(e) {
    dragActive = false;
    try { boardEl.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
  }
  boardEl.addEventListener('pointerup', endDrag);
  boardEl.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', function () {
    computeCellSize();
    renderBoard();
    renderPath();
  });

  todayStr = dateStrOf(todayUTC());
  loadDate(todayStr);
})();

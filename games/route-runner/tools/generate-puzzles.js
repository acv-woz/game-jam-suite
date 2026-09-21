#!/usr/bin/env node
'use strict';

// The generation "apparatus" itself lives in ../web/generator.js (shared,
// dependency-free JS that runs unmodified in the browser or in Node). This
// is the maintainer-facing CLI around it: preview a single day's puzzle, or
// bulk-verify that a run of future days all generate cleanly.

var gen = require('../web/generator.js');

function usage() {
  console.log('Usage:');
  console.log('  node generate-puzzles.js <YYYY-MM-DD>   Print that date\'s puzzle as JSON');
  console.log('  node generate-puzzles.js <N>             Sanity-check the next N days from today');
}

var arg = process.argv[2];
if (!arg) {
  usage();
  process.exit(1);
}

if (/^\d+$/.test(arg)) {
  var days = parseInt(arg, 10);
  var start = new Date();
  var failures = 0;
  var sizeCounts = { 5: 0, 6: 0 };
  for (var i = 0; i < days; i++) {
    var d = new Date(start.getTime() + i * 86400000);
    var dateStr = d.toISOString().slice(0, 10);
    try {
      var puzzle = gen.generatePuzzle(dateStr);
      sizeCounts[puzzle.size] = (sizeCounts[puzzle.size] || 0) + 1;
      console.log(dateStr + '  ' + puzzle.size + 'x' + puzzle.size + '  ' + puzzle.checkpoints.length + ' stops  OK');
    } catch (e) {
      failures++;
      console.error(dateStr + '  FAILED: ' + e.message);
    }
  }
  console.log('');
  console.log(sizeCounts[5] + ' day(s) at 5x5, ' + sizeCounts[6] + ' day(s) at 6x6.');
  console.log(failures === 0 ? ('All ' + days + ' day(s) generated cleanly.') : (failures + ' failure(s).'));
  process.exit(failures === 0 ? 0 : 1);
} else {
  var single = gen.generatePuzzle(arg);
  console.log(JSON.stringify(single, null, 2));
}

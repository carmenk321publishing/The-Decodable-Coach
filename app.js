(function () {
'use strict';
var E = window.UFLIEngine;
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
var LESSONS = window.UFLI_LESSON_TXT.trim().split('\n').map(function (l) { var p = l.split('|'); return {id: p[0], unit: p[1], concept: p[2], grade: p[3], n: parseInt(p[0], 10)}; });
var byN = function (n) { return LESSONS.filter(function (l) { return l.n === n; })[0]; };
var lab = function (n) { var l = byN(n); return l ? 'Lesson ' + n + ' (' + l.concept + ')' : 'Lesson ' + n; };
var EX = {
  fit: {lesson: '17', text: 'Gus got a bug.\nThe bug sat in a cup.\nGus hid the cup.\nA bug can hum.'},
  refine: {lesson: '18', text: 'Ben fed the hen.\nThe hen can stand on the bed.\nBen met a red hen.'},
  later: {lesson: '20', text: 'The rain fell in the night.\nDan sat by the lake.\nThe boat can float.'}
};
var state = {done: {}, result: null};
var sel = $('#lesson');
var units = [];
LESSONS.forEach(function (l) { if (units.indexOf(l.unit) < 0) units.push(l.unit); });
units.forEach(function (u) {
  var g = document.createElement('optgroup'); g.label = u;
  LESSONS.filter(function (l) { return l.unit === u; }).forEach(function (l) { var o = document.createElement('option'); o.value = l.id; o.textContent = 'Lesson ' + l.id + ' · ' + l.concept; g.appendChild(o); });
  sel.appendChild(g);
});
sel.value = '17';
function cur() { return LESSONS.filter(function (l) { return l.id === sel.value; })[0]; }
function drawCard() {
  var l = cur(), t = '';
  if (l.n < 8) t = '<p><b>Note:</b> official UFLI decodable passages begin at Lesson 8. Before that, short phrases and word chains are more typical.</p>';
  $('#lessonCard').innerHTML = '<h3>Lesson ' + esc(l.id) + ' · ' + esc(l.concept) + '</h3><p>' + esc(l.unit) + ' unit · typical grade: ' + esc(l.grade) + '</p><p>Available to your writing: every pattern from Lessons 1–' + l.n + '.</p>' + t;
}
sel.addEventListener('change', function () { state.result = null; drawCard(); }); drawCard();

function go(n) {
  $$('.stage').forEach(function (s) { s.classList.toggle('is-active', s.dataset.stage === String(n)); });
  $$('.tab').forEach(function (t) { t.classList.toggle('is-active', t.dataset.go === String(n)); });
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function mark(n) {
  for (var i = 1; i <= n; i++) state.done[i] = true;
  $$('.tab').forEach(function (t) { t.classList.toggle('is-done', !!state.done[t.dataset.go]); });
  $('#archive').dataset.built = Object.keys(state.done).join('');
}
$$('[data-go]').forEach(function (b) { b.addEventListener('click', function () {
  var n = parseInt(b.dataset.go, 10);
  if (n >= 3 && !state.result) { if (!$('#draft').value.trim()) { go(2); return; } run(); if (n === 4) { mark(3); go(4); } return; }
  if (n === 2) mark(1);
  if (n === 4) mark(3);
  go(n);
}); });
$$('[data-ex]').forEach(function (b) { b.addEventListener('click', function () { var e = EX[b.dataset.ex]; sel.value = e.lesson; drawCard(); $('#draft').value = e.text; state.result = null; }); });
$('#draft').addEventListener('input', function () { state.result = null; });
$('#theme').addEventListener('click', function () { var h = document.documentElement; h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark'; });

var TOK = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
var CLS = {target: ['w-target', '◆', 'Target'], review: ['w-review', '✓', 'Review'], heartok: ['w-heart', '♥', 'Heart word (taught)'], heartchk: ['w-heart', '♥', 'Heart word (confirm)'], soon: ['w-soon', '▲', 'Coming soon'], later: ['w-later', '▼', 'Coming later'], check: ['w-check', '?', 'Check manually']};

function run() {
  var raw = $('#draft').value.replace(/[’‘]/g, "'");
  if (!raw.trim() || !(raw.match(TOK) || []).length) { $('#err').hidden = false; go(2); return; }
  $('#err').hidden = true;
  var l = cur(), T = l.n;
  var start = Math.min.apply(null, LESSONS.filter(function (x) { return x.unit === l.unit; }).map(function (x) { return x.n; }));
  var isRev = /review/i.test(l.concept);
  var lo = isRev ? start : T;
  var taught = {}; ($('#heart').value.toLowerCase().match(/[a-z']+/g) || []).forEach(function (w) { taught[w] = 1; });
  var toks = raw.match(TOK), rows = {}, order = [], counts = {target: 0, review: 0, heartok: 0, heartchk: 0, soon: 0, later: 0, check: 0};
  toks.forEach(function (t) {
    var w = t.toLowerCase();
    if (!rows[w]) {
      var r = E.analyze(w), c;
      if (taught[w]) c = 'heartok';
      else if (r.kind === 'heart') c = 'heartchk';
      else if (r.kind === 'check') c = 'check';
      else if (r.lesson > T) c = r.lesson <= T + 10 ? 'soon' : 'later';
      else c = r.lesson >= lo ? 'target' : 'review';
      rows[w] = {w: w, r: r, c: c, n: 0}; order.push(w);
    }
    rows[w].n++; counts[rows[w].c]++;
  });
  var words = order.map(function (w) { return rows[w]; });
  var total = toks.length, ahead = counts.soon + counts.later;
  var decodable = total - counts.heartok - counts.heartchk - counts.check;
  var maxL = 0; words.forEach(function (x) { if (x.r.kind === 'word' && x.r.lesson > maxL && x.c !== 'heartok') maxL = x.r.lesson; });
  var tone, title, icon, pts = [];
  var share = decodable ? ahead / decodable : 0;
  var uniqAhead = words.filter(function (x) { return x.c === 'soon' || x.c === 'later'; }).length;
  if (!ahead && counts.target > 0) { tone = 'fit'; icon = '◆'; title = 'Fits Lesson ' + l.id; pts.push('Every decodable word uses patterns taught through ' + lab(T) + ', and ' + counts.target + ' word' + (counts.target === 1 ? '' : 's') + ' practise the target.'); }
  else if (!ahead) { tone = 'refine'; icon = '▲'; title = 'Readable, but add more of the target'; pts.push('No words are ahead of the level, but none use the target pattern of ' + lab(T) + '. Add words that practise it.'); }
  else if (share <= 0.15 || uniqAhead <= 3) { tone = 'refine'; icon = '▲'; title = 'Close: refine ' + uniqAhead + ' word' + (uniqAhead === 1 ? '' : 's'); pts.push('Most of the draft fits. Swap the flagged words, or let students meet the draft after ' + lab(maxL) + '.'); }
  else { tone = 'later'; icon = '▼'; title = maxL <= T + 10 ? 'Language arrives soon: better after Lesson ' + maxL : 'Language comes later: better after Lesson ' + maxL; pts.push(Math.round(share * 100) + '% of the decodable words use patterns taught after Lesson ' + l.id + '. Consider moving this text to ' + lab(maxL) + ' or simplifying it.'); }
  if (counts.heartchk) pts.push(counts.heartchk + ' heart word' + (counts.heartchk === 1 ? '' : 's') + ' not on your taught list. Confirm UFLI has introduced them by this lesson, or add them to the list in Step 2.');
  if (counts.check) pts.push(counts.check + ' word' + (counts.check === 1 ? '' : 's') + ' need a manual check (contractions, unusual spellings).');
  if (maxL && ahead) pts.push('The latest pattern found is in ' + lab(maxL) + '.');
  var stats = ['Words: ' + total, 'Target ◆ ' + counts.target, 'Review ✓ ' + counts.review, 'Heart ♥ ' + (counts.heartok + counts.heartchk), 'Soon ▲ ' + counts.soon, 'Later ▼ ' + counts.later, 'Check ? ' + counts.check];
  $('#verdict').innerHTML = '<div class="verdict" data-tone="' + tone + '"><h2><span aria-hidden="true">' + icon + '</span>' + esc(title) + '</h2><ul>' + pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul><div class="stats">' + stats.map(function (s) { return '<span class="stat">' + s + '</span>'; }).join('') + '</div></div>';
  $('#annot').innerHTML = esc(raw).replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, function (t) {
    var x = rows[t.toLowerCase()]; if (!x) return t; var c = CLS[x.c];
    return '<span class="w ' + c[0] + '" title="' + c[2] + (x.r.lesson ? ' · ' + esc(lab(x.r.lesson)) : '') + '">' + t + '<sup>' + c[1] + '</sup></span>';
  });
  var tb = $('#wtable tbody'); tb.innerHTML = '';
  words.slice().sort(function (a, b) { return b.r.lesson - a.r.lesson; }).forEach(function (x) {
    var c = CLS[x.c], why = x.r.why + (x.r.flags.length ? ' · ' + x.r.flags.join('; ') : '');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><b>' + esc(x.w) + '</b>' + (x.n > 1 ? ' ×' + x.n : '') + '</td><td>' + c[1] + ' ' + c[2] + '</td><td>' + (x.r.lesson ? x.r.lesson : '–') + '</td><td>' + esc(why) + '</td>';
    tb.appendChild(tr);
  });
  var bankAll = E.BANK.map(function (b) { return {w: b, l: E.analyze(b).lesson}; }).filter(function (b) { return b.l <= T && b.l > 0; });
  var flagged = words.filter(function (x) { return x.c === 'soon' || x.c === 'later'; });
  var rf = flagged.map(function (x) {
    var alts = bankAll.filter(function (b) { return b.w[0] === x.w[0]; }).slice(0, 6).map(function (b) { return b.w; });
    if (!alts.length) alts = bankAll.filter(function (b) { return b.l >= lo; }).slice(0, 6).map(function (b) { return b.w; });
    return '<div class="sug"><b>' + esc(x.w) + '</b> · ' + esc(x.r.why) + ' is taught in ' + esc(lab(x.r.lesson)) + '. Try: ' + (alts.length ? esc(alts.join(', ')) : 'a simpler word') + ', or move the draft to after Lesson ' + x.r.lesson + '.</div>';
  });
  if (counts.target === 0 && !ahead) rf.push('<div class="sug">Add words that practise the target of ' + esc(lab(T)) + ' (see the word bank below).</div>');
  if (!rf.length) rf.push('<div class="sug">Nothing to swap. Read the draft aloud once more for natural phrasing and meaning.</div>');
  $('#refine').innerHTML = rf.join('');
  var tgt = bankAll.filter(function (b) { return b.l >= lo; }), rev = bankAll.filter(function (b) { return b.l < lo; });
  $('#bank').innerHTML = tgt.concat(rev.slice(0, 60)).map(function (b) { var c = b.l >= lo ? CLS.target : CLS.review; return '<span class="w ' + c[0] + '">' + c[1] + ' ' + esc(b.w) + '</span>'; }).join('') || 'No words in the built-in bank for this level.';
  state.result = {lesson: l, title: title, pts: pts, stats: stats, words: words, rf: flagged, text: raw};
  mark(2); mark(3); go(3);
}
$('#run').addEventListener('click', run);
$('#dl').addEventListener('click', function () {
  var r = state.result; if (!r) return;
  var out = ['The Decodable Coach report', 'Target: Lesson ' + r.lesson.id + ' - ' + r.lesson.concept, '', 'Result: ' + r.title].concat(r.pts.map(function (p) { return '- ' + p; }), ['', r.stats.join(' | '), '', 'Flagged words:']);
  r.rf.forEach(function (x) { out.push('- ' + x.w + ' (' + x.r.why + ', Lesson ' + x.r.lesson + ')'); });
  if (!r.rf.length) out.push('- none');
  out.push('', 'Draft:', r.text, '', 'The Decodable Coach is inspired by the UFLI Foundations scope and sequence but is not officially aligned with, reviewed by, or endorsed by UFLI or the University of Florida. It is a rule-based first pass; verify decisions in the official UFLI Foundations Toolbox.');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out.join('\n')], {type: 'text/plain'})); a.download = 'decodable-coach-report.txt'; a.click();
  mark(4);
});
$('#print').addEventListener('click', function () { mark(4); window.print(); });
})();

(function (root) {
'use strict';
var GR = {
a:[1,'a /ă/'],m:[2,'m'],s:[3,'s'],t:[4,'t'],p:[6,'p'],f:[7,'f'],i:[8,'i /ĭ/'],n:[9,'n'],o:[12,'o /ŏ/'],d:[13,'d'],c:[14,'c /k/'],u:[15,'u /ŭ/'],g:[16,'g'],b:[17,'b'],e:[18,'e /ĕ/'],k:[22,'k'],h:[23,'h'],r:[24,'r'],l:[26,'l'],w:[28,'w'],j:[29,'j'],y:[30,'y'],x:[31,'x'],qu:[32,'qu /kw/'],v:[33,'v'],z:[34,'z'],
ff:[42,'ff (FLSZ rule)'],ll:[42,'ll (FLSZ rule)'],ss:[42,'ss (FLSZ rule)'],zz:[42,'zz (FLSZ rule)'],
all:[43,'-all'],oll:[43,'-oll'],ull:[43,'-ull'],ck:[44,'ck /k/'],sh:[45,'sh /sh/'],th:[47,'th /th/'],ch:[48,'ch /ch/'],wh:[50,'wh /w/'],ph:[50,'ph /f/'],ng:[51,'ng /ŋ/'],nk:[52,'nk /ŋk/'],
tch:[69,'tch /ch/'],dge:[70,'dge /j/'],ar:[77,'ar /ar/'],or:[78,'or /or/'],ore:[78,'ore /or/'],er:[80,'er /er/'],ir:[81,'ir /er/'],ur:[81,'ur /er/'],
ai:[84,'ai /ā/'],ay:[84,'ay /ā/'],ee:[85,'ee /ē/'],ea:[85,'ea /ē/'],ey:[85,'ey /ē/'],oa:[86,'oa /ō/'],ow:[86,'ow /ō/'],oe:[86,'oe /ō/'],ie:[87,'ie /ī/'],igh:[87,'igh /ī/'],
oo:[89,'oo /oo/'],ew:[91,'ew /ū/'],ui:[91,'ui /ū/'],ue:[91,'ue /ū/'],au:[93,'au /aw/'],aw:[93,'aw /aw/'],augh:[93,'augh /aw/'],oi:[95,'oi /oi/'],oy:[95,'oy /oi/'],ou:[96,'ou /ow/'],
kn:[98,'kn /n/'],wr:[98,'wr /r/'],mb:[98,'mb /m/'],air:[112,'air /air/'],are:[112,'are /air/'],ear:[112,'ear /air/'],eigh:[114,'eigh /ā/'],ei:[114,'ei /ā/'],eu:[115,'eu /yū/'],ough:[116,'ough'],gn:[118,'gn /n/'],tion:[119,'-tion'],sion:[119,'-sion'],ture:[120,'-ture']
};
var AMB = {ow:'ow can say /ō/ (L86) or /ow/ (L96)',ea:'ea can say /ē/ (L85) or /ĕ/ (L94)',oo:'oo can say /oo/ (L89) or /ū/ (L90)',ou:'ou can say /ow/ (L96) or other sounds later'};
var END = {all:1,oll:1,ull:1,mb:1,ore:1,are:1,ture:1}, START = {kn:1,wr:1};
var VOW = 'aeiou';
var HEART = new Set('the a i to do you was of said are were they there their what where who one two once some come put he she we me be go no so from want your could would should says been any many oh'.split(' '));
var EXC = {is:[21,'s /z/ (L21)'],as:[21,'s /z/ (L21)'],his:[21,'s /z/ (L21)'],has:[21,'s /z/ (L21)'],have:[62,'VCe exception (L62)'],give:[62,'VCe exception (L62)'],get:[18,'e /ĕ/'],push:[89,'u /oo/ (L89)'],pull:[89,'u /oo/ (L89)'],bush:[89,'u /oo/ (L89)']};
var HARDG = new Set('get gift give girl begin together tiger target giggle forget gear geese'.split(' '));
var VOICED = new Set('this that then them these those than with'.split(' '));
var BANK_TXT = 'am an at as ax bad bag bat bed big bin bit bog box bug bus but cab can cap cat cod cop cot cub cup cut dad den did dig dim dip dog dot dug fan fat fed fig fin fit fix fog fun gap gas got gum gun gut had ham hat hen hid him hip hit hog hop hot hub hug hum hut jam jet job jog jug keg kid kit lap led leg let lid lip lit log lot mad man map mat men met mix mom mop mud mug nap net nip nod not nun nut pad pan pat peg pen pet pig pin pit pop pot pup rag ram ran rat red rib rid rip rob rod rot rub rug run sad sat set sip sit sob sun tab tag tan tap ten tin tip top tub tug van vet wag web wet wig win wit yam yes yet zip zap fast clamp grin twist frog stomp plant drift slug jump blend chest help crust sprint best list lamp hand sand land milk tent nest desk fish dish ship shop shut chin chip chop much such this that then them with thin thick path bath moth ring sing song long king wing pink sink bank think duck back sock neck pick kick rock luck miss fill bell doll full ball tall call small cake make take game name lake late safe page face race nice time like bike hide ride side bite kite smile five home hope nose rope bone note stone cube tune huge use cute mule rule these jumped landed jumping hopping hopped boxes wishes sunset rabbit robot magic basket picnic match catch badge bridge fudge cold child find most bolt cry fly my try sky happy funny sunny baby table little puzzle apple farm car star dark park corn born storm more store fern her bird girl turn burn fur work word rain play stay day train tail feet tree green sleep team read eat sea beach key boat road coat snow grow toe night light right high sight pie tie book look good foot moon food zoo blue true fruit new few chew haul saw paw draw coin boil toy boy joy cloud out house cow now brown down knee knit write wrist lamb thumb slow kind help fear tried cried kindness payment artist teacher actor picture mission action readable visible bicycle';
var BANK = BANK_TXT.split(' ');
var BANKSET = new Set(BANK);

function syl(w) {
  var s = w.replace(/^y(?=[aeiou])/, ''); var m = s.match(/[aeiouy]+/g) || []; var n = m.length;
  if (n > 1 && /[^aeiouy]e$/.test(s) && !/[^aeiouy]le$/.test(s)) n--;
  return Math.max(n, 1);
}
function seg(w, reasons, flags, nsyl) {
  var units = [], i = 0, L = w.length;
  while (i < L) {
    var hit = null;
    for (var len = Math.min(4, L - i); len >= 1; len--) {
      var sub = w.substr(i, len);
      if (!GR[sub]) continue;
      if (len > 1) {
        if (END[sub] && i + len !== L) continue;
        if (START[sub] && i !== 0) continue;
      }
      hit = sub; break;
    }
    if (!hit) return null;
    var g = hit, les = GR[g][0], lab = GR[g][1], v = /[aeiou]/.test(g[0]) && g !== 'qu' || /^(ar|or|er|ir|ur|ore|are)$/.test(g);
    var nxt = w[i + g.length] || '';
    if (g === 'th' && VOICED.has(w)) { les = 46; lab = 'th /th/ (voiced)'; }
    if (g === 'c' && /[eiy]/.test(nxt)) { les = 117; lab = 'soft c /s/'; }
    if (g === 'g' && /[eiy]/.test(nxt) && !HARDG.has(w)) { les = 117; lab = 'soft g /j/'; }
    if (g === 'y') {
      if (i === 0) { les = 30; lab = 'y /y/'; }
      else if (i === L - 1 && units.length && !units[units.length - 1].v) { v = true; if (nsyl === 1) { les = 73; lab = 'y /ī/'; } else { les = 74; lab = 'y /ē/'; } }
      else { v = true; les = 118; lab = 'y as a vowel inside a word'; }
    }
    if (AMB[g] && flags.indexOf(AMB[g]) < 0) flags.push(AMB[g]);
    units.push({g: g, v: v, les: les, lab: lab}); i += g.length;
  }
  for (var k = 0; k < units.length; k++) {
    reasons.push({lesson: units[k].les, label: units[k].lab});
    if (k && !units[k].v && !units[k - 1].v) { if (!reasons.some(function (r) { return r.label === 'consonant blend'; })) reasons.push({lesson: 35, label: 'consonant blend'}); }
  }
  return units;
}
function direct(w) {
  var reasons = [], flags = [], nsyl = syl(w), head = w;
  if (/[^aeiouy]le$/.test(w) && w.length > 3) { reasons.push({lesson: 75, label: '-le ending'}); head = w.slice(0, -2); }
  else if (/[cg]e$/.test(w) && w.length > 2) {
    var isC = w.slice(-2, -1) === 'c'; reasons.push({lesson: isC ? 60 : 61, label: isC ? 'ce /s/' : 'ge /j/'}); head = w.slice(0, -2);
    var pv = w.slice(-3, -2); if (VOW.indexOf(pv) >= 0) { var vl = {a:54,e:57,i:55,o:56,u:58}[pv]; reasons.push({lesson: vl, label: pv + '_e VCe'}); head = w.slice(0, -2); }
  }
  else if (/ore$/.test(w) || /are$/.test(w)) { head = w; }
  else if (/[aeiou]re$/.test(w)) { reasons.push({lesson: 118, label: 'r-controlled + e (ire/ure/ere)'}); head = w.slice(0, -1); }
  else if (/(^|[^aeiou])[aeiou](th|[b-df-hj-np-tv-z])e$/.test(w)) {
    var m = w.match(/([aeiou])(th|[b-df-hj-np-tv-z])e$/); var l2 = {a:54,e:57,i:55,o:56,u:58}[m[1]];
    reasons.push({lesson: l2, label: m[1] + '_e VCe'}); head = w.slice(0, -1);
  }
  else if (/[b-df-hj-np-tv-z]e$/.test(w) && w.length > 2) { reasons.push({lesson: 118, label: 'silent final e outside VCe'}); head = w.slice(0, -1); }
  if (/[aeiou]{2}[^aeiouy]e$/.test(w)) { reasons.push({lesson: 118, label: 'vowel team + silent e'}); }
  var u = seg(head, reasons, flags, nsyl);
  if (!u) return null;
  if (nsyl > 1) reasons.push({lesson: 66, label: 'multisyllable word'});
  return {reasons: reasons, flags: flags};
}
function res(rs, flags, kind) {
  var top = rs[0] || {lesson: 0, label: ''};
  rs.forEach(function (r) { if (r.lesson > top.lesson) top = r; });
  return {kind: kind || 'word', lesson: top.lesson, why: top.label, reasons: rs, flags: flags || []};
}
function vowelish(b) { return /[aeiouy]/.test(b); }
function analyze(word, depth) {
  depth = depth || 0;
  var w = String(word).toLowerCase().replace(/[^a-z']/g, '');
  if (!w) return null;
  if (/'/.test(w)) return {kind: 'check', lesson: 0, why: 'contraction/possessive', reasons: [], flags: ['Apostrophes are not in the lesson map; check the official sequence before using.']};
  if (HEART.has(w)) return {kind: 'heart', lesson: 0, why: 'irregular (heart) word', reasons: [], flags: []};
  if (EXC[w]) return res([{lesson: EXC[w][0], label: EXC[w][1]}], []);
  function tryBase(base, extra, sufLesson, sufLabel, needBank) {
    if (base.length < 2 || !vowelish(base) || depth > 1) return null;
    if (needBank === 'bank' && !BANKSET.has(base)) return null;
    if (needBank === 'mono' && !BANKSET.has(base) && !(base.length >= 4 && syl(base) === 1)) return null;
    var b = analyze(base, depth + 1);
    if (!b) return null;
    if (b.kind === 'heart') return b;
    if (b.kind !== 'word') return null;
    var rs = b.reasons.slice(); rs.push({lesson: sufLesson, label: sufLabel});
    if (extra) rs.push(extra);
    return res(rs, b.flags);
  }
  var out = null, m;
  var dbl = function (b) { return /([b-df-hj-np-tv-z])\1$/.test(b) && !/(ff|ll|ss|zz)$/.test(b); };
  var dropE = function (b) { return syl(b) === 1 && /(^|[^aeiou])[aeiou][b-df-hj-np-tv-z]$/.test(b) && !/[wxy]$/.test(b); };
  if (w.length >= 5 && /(ed|ing)$/.test(w)) {
    var isEd = /ed$/.test(w), base = w.slice(0, isEd ? -2 : -3), sl = isEd ? 64 : 65, sn = isEd ? '-ed' : '-ing';
    if (dbl(base)) out = tryBase(base.slice(0, -1), {lesson: 107, label: 'doubling rule'}, sl, sn);
    if (!out && dropE(base) && !BANKSET.has(base)) out = tryBase(base + 'e', {lesson: 109, label: 'drop-e rule'}, sl, sn);
    if (!out && dropE(base) && BANKSET.has(base + 'e')) out = tryBase(base + 'e', {lesson: 109, label: 'drop-e rule'}, sl, sn);
    if (!out) out = tryBase(base, null, sl, sn);
    if (!out && isEd && /[^aeiou]ed$/.test(w)) out = tryBase(w.slice(0, -1), null, sl, sn);
    if (!out && isEd && /ied$/.test(w)) out = tryBase(w.slice(0, -3) + 'y', {lesson: 110, label: 'y-to-i rule'}, sl, sn);
    if (out) return out;
  }
  if (w.length >= 4 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) {
    if ((m = w.match(/^(.*(?:x|z|ch|sh|tch|s))es$/))) { out = tryBase(m[1], null, 63, '-es'); if (out) return out; }
    var b1 = w.slice(0, -1), sl2 = /(p|t|k|f|th)$/.test(b1) ? 20 : 21;
    if (b1.length >= 3) { out = tryBase(b1, null, sl2, sl2 === 20 ? 's /s/ ending' : 's /z/ ending'); if (out) return out; }
  }
  var sfx = [['est', 100, '-est', 'bank'], ['er', 100, '-er', 'bank'], ['ly', 101, '-ly', 'mono'], ['less', 102, '-less', 'mono'], ['ful', 102, '-ful', 'mono'], ['ness', 124, '-ness', 'mono'], ['ment', 125, '-ment', 'mono'], ['ish', 122, '-ish', 'mono']];
  for (var i = 0; i < sfx.length; i++) {
    var s = sfx[i];
    if (w.length > s[0].length + 2 && w.slice(-s[0].length) === s[0]) {
      var bb = w.slice(0, -s[0].length), ex = null, r2 = null;
      if (s[0] === 'est' || s[0] === 'er') { if (dbl(bb)) { ex = {lesson: 108, label: 'doubling rule'}; bb = bb.slice(0, -1); } else if (!BANKSET.has(bb) && BANKSET.has(bb + 'e')) { ex = {lesson: 109, label: 'drop-e rule'}; bb += 'e'; } }
      r2 = tryBase(bb, ex, s[1], s[2], s[3]);
      if (r2) return r2;
    }
  }
  var pfx = [['un', 103], ['pre', 104], ['re', 104], ['dis', 105]];
  for (var j = 0; j < pfx.length; j++) {
    var p = pfx[j];
    if (w.indexOf(p[0]) === 0 && w.length > p[0].length + 2) {
      var r3 = tryBase(w.slice(p[0].length), null, p[1], p[0] + '- prefix', 'bank');
      if (r3) return r3;
    }
  }
  var d = direct(w);
  if (!d) return {kind: 'check', lesson: 0, why: 'unrecognised spelling', reasons: [], flags: ['Could not map this spelling to a lesson; check it manually.']};
  return res(d.reasons, d.flags);
}
root.UFLIEngine = {analyze: analyze, BANK: BANK, HEART: HEART};
if (typeof module !== 'undefined') module.exports = root.UFLIEngine;
})(typeof window !== 'undefined' ? window : globalThis);

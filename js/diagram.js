// Call map: Rough.js hand-drawn geometry with two-pass liquid-glass boxes.
// Renders the small thumbnail for the home Continue card and the live,
// step-synchronised map inside the split-pane step reader.
import { esc } from './render.js';
import { PARTS } from './data.js';
import { store } from './store.js';

/* ═════════ The six call steps ═════════
   Every guide is laid out in the order the call is run. The 11 numbered parts
   of a full guide keep their indices (saved progress stores 0..10); the four
   panels r, c, a and m sit between them and are not numbered parts. */
export const CALL_STEPS = [
  { id: 'step-1', n: 1, label: 'Be Ready', short: 'Ready', tone: 'slate',
    desc: 'What to have open and know before you pick up',
    me: 'Last call closed, notes done, the right screens open, full attention on this client.',
    client: 'They reach someone who is present from the first word and does not make them wait while screens load.',
    full: ['r'], brief: ['r'] },
  { id: 'step-2', n: 2, label: 'Welcome and Listen', short: 'Listen', tone: 'red',
    desc: 'What they say, need, feel and fear losing, then your first 15 seconds',
    me: 'Greet, then listen for the words and for the voice behind them before I touch anything.',
    client: 'They tell it once, without being cut off, and hear their own problem said back.',
    full: ['0', '1', '2', '3', '5'], brief: ['0', '1'] },
  { id: 'step-3', n: 3, label: 'Solve Immediate Need', short: 'Solve', tone: 'teal',
    desc: 'Risk checks, questions in order, options, and what to say',
    me: 'Check the risks, ask the questions in order, fix what they called about.',
    client: 'The thing they called about gets dealt with, and they are told what is happening while it does.',
    full: ['4', '6', '7', '8'], brief: ['2', '3'] },
  { id: 'step-4', n: 4, label: 'Checkpoint', short: 'Check', tone: 'vio',
    desc: 'Confirm it is sorted before you move on',
    me: 'Stop and confirm the fix worked and that I solved the problem they actually had.',
    client: 'They get to say "yes, that is sorted" in their own words, or tell me what is still open.',
    full: ['c'], brief: ['c'] },
  { id: 'step-5', n: 5, label: 'Deeper Discovery and Additional Advice', short: 'Advise', tone: 'amber',
    desc: 'Questions to ask, options with their trade-offs, and what to leave alone',
    me: 'Ask what sits behind the call and offer options with the trade-off of each. The choice is theirs.',
    client: 'They leave knowing something useful they did not know to ask for, with nothing pushed on them.',
    full: ['a'], brief: ['a'] },
  { id: 'step-6', n: 6, label: 'Making Their Day', short: 'Close', tone: 'green',
    desc: 'Recap, closing lines, notes, and what to tell your lead',
    me: 'Recap, close warmly, then write the note that saves the next advisor from asking again.',
    client: 'They hang up knowing what was done, what happens next and when, and they do not have to call back.',
    full: ['m', '9', '10'], brief: ['m'] }
];

// Tone colours as inline values, so the two tones the stylesheet has no class for still render.
export const TONE_VAR = {
  slate: 'var(--ink-soft)',
  red: 'var(--failure)',
  teal: 'var(--teal)',
  vio: 'var(--proposal)',
  amber: 'var(--accent)',
  green: 'var(--step-green, #3fb984)'
};

export const PANELS = {
  r: { label: 'Be ready for this call', node: 'Be ready', hint: 'What to have open and know before you pick up' },
  c: { label: 'Checkpoint', node: 'Checkpoint', hint: 'Confirm it is sorted before you move on' },
  a: { label: 'Deeper discovery and advice', node: 'Advice', hint: 'Questions to ask, options with the trade-off of each, and what to leave for another day' },
  m: { label: 'Making their day', node: 'Closing lines', hint: 'Recap and closing lines' }
};

// The guide in call order: [{ key, step, code }]. Code is the step number plus a
// letter when the step holds more than one screen (2a, 2b, ...).
export function callSequence(hasBreakdown) {
  const out = [];
  CALL_STEPS.forEach(st => {
    const keys = hasBreakdown ? st.full : st.brief;
    keys.forEach((key, k) => out.push({
      key, step: st, code: keys.length > 1 ? `${st.n}${String.fromCharCode(97 + k)}` : String(st.n)
    }));
  });
  return out;
}

export function stepForKey(key, hasBreakdown) {
  const k = String(key);
  return CALL_STEPS.find(st => (hasBreakdown ? st.full : st.brief).includes(k)) || null;
}

/* ═════════ Rough.js Deterministic Sketch Engine ═════════
   Deterministic FNV-1a seed per element ID so hand-drawn geometry never
   shimmers or reshuffles when scrubbing steps or hovering nodes. */
export function getRoughGen() {
  if (typeof window !== 'undefined' && window.rough && window.rough.generator) {
    return window.rough.generator();
  }
  return null;
}

const SKETCH = {
  roughness: 0.92,
  bowing: 0.85,
  disableMultiStroke: true,
  preserveVertices: true
};

export function seedOf(id) {
  const s = String(id || 'dg');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (Math.abs(h) % 2147483646) + 1;
}

export function sketch(d, id, extra) {
  const rg = getRoughGen();
  if (!rg || !d) return d;
  const drawable = rg.path(d, Object.assign({}, SKETCH, { seed: seedOf(id) }, extra));
  const paths = rg.toPaths(drawable);
  return paths.map(p => p.d).join(' ');
}

export function sketchHachure(x, y, w, h, id, extra) {
  const rg = getRoughGen();
  if (!rg) return '';
  const drawable = rg.rectangle(x, y, w, h, Object.assign({
    roughness: 1.1,
    bowing: 0.85,
    fill: '#000',
    fillStyle: 'hachure',
    fillWeight: 1,
    hachureGap: 6.5,
    hachureAngle: -41,
    stroke: 'none',
    disableMultiStroke: true,
    seed: seedOf(id + ':hachure')
  }, extra));
  const paths = rg.toPaths(drawable);
  return paths.map(p => p.d).join(' ');
}

export function roundRectD(x, y, w, h, r) {
  const c = Math.min(r, w / 2, h / 2);
  return `M ${x + c} ${y} H ${x + w - c} Q ${x + w} ${y} ${x + w} ${y + c} V ${y + h - c} Q ${x + w} ${y + h} ${x + w - c} ${y + h} H ${x + c} Q ${x} ${y + h} ${x} ${y + h - c} V ${y + c} Q ${x} ${y} ${x + c} ${y} Z`;
}

export function circleD(cx, cy, r) {
  const k = r * 0.5523;
  return `M ${cx} ${cy - r} C ${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy} C ${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r} C ${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy} C ${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r} Z`;
}

export function diamondD(cx, cy, rx, ry) {
  return `M ${cx} ${cy - ry} L ${cx + rx} ${cy} L ${cx} ${cy + ry} L ${cx - rx} ${cy} Z`;
}

/* ═════════ Rough.js Banking Card Glyph / Logo ═════════
   Exquisite hand-drawn banking card icon featuring an EMV smart chip,
   contactless NFC waves, embossed card numbers, and payment brand circles. */
export function renderRoughCardLogo({ width = 28, height = 20, className = 'rough-card-logo', seed = 'brand-logo' } = {}) {
  const cardW = 28;
  const cardH = 20;
  const r = 2.8;

  // 1. Crisp inner liquid fill with glass shine
  const fillD = roundRectD(1, 1, cardW - 2, cardH - 2, r);

  // 2. Hand-drawn outer card perimeter
  const perimeterD = sketch(roundRectD(1, 1, cardW - 2, cardH - 2, r), `${seed}:body`, {
    roughness: 0.85,
    bowing: 0.75,
    strokeWidth: 1.35
  });

  // 3. Hand-drawn EMV Smart Chip
  const chipFillD = roundRectD(4.2, 5.2, 5.4, 4.2, 0.8);
  const chipOutlineD = sketch(roundRectD(4.2, 5.2, 5.4, 4.2, 0.8), `${seed}:chip`, {
    roughness: 0.6,
    strokeWidth: 0.95
  });
  const chipLinesD = sketch('M 6.9 5.2 V 9.4 M 4.2 7.3 H 9.6', `${seed}:chiplines`, {
    roughness: 0.5,
    strokeWidth: 0.75
  });

  // 4. Contactless NFC Radiowaves
  const nfc1 = sketch('M 12 5.6 C 13.2 6.5 13.2 8.1 12 9.0', `${seed}:nfc1`, {
    roughness: 0.7,
    strokeWidth: 0.9
  });
  const nfc2 = sketch('M 13.8 4.6 C 15.6 5.8 15.6 8.8 13.8 10.0', `${seed}:nfc2`, {
    roughness: 0.7,
    strokeWidth: 0.9
  });

  // 5. Embossed Card Number Segments
  const numsD = sketch('M 4.2 12.8 H 7.2 M 8.8 12.8 H 11.8 M 13.4 12.8 H 16.4 M 18.0 12.8 H 21.0', `${seed}:nums`, {
    roughness: 0.6,
    strokeWidth: 1.05
  });

  // 6. Payment Network Circles
  const c1D = sketch(circleD(19.8, 15.6, 2.2), `${seed}:brand1`, {
    roughness: 0.65,
    strokeWidth: 0.85
  });
  const c2D = sketch(circleD(22.6, 15.6, 2.2), `${seed}:brand2`, {
    roughness: 0.65,
    strokeWidth: 0.85
  });

  return `<svg class="${className}" viewBox="0 0 ${cardW} ${cardH}" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="rcard-fill" d="${fillD}" fill="currentColor" fill-opacity="0.14" />
    <path class="rcard-chip-fill" d="${chipFillD}" fill="var(--gold, #e5b869)" fill-opacity="0.32" />
    <path class="rcard-stroke" d="${perimeterD}" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
    <path class="rcard-chip-stroke" d="${chipOutlineD}" stroke="var(--gold, #e5b869)" stroke-width="0.95" stroke-linecap="round" />
    <path class="rcard-chip-core" d="${chipLinesD}" stroke="var(--gold, #e5b869)" stroke-width="0.75" stroke-linecap="round" opacity="0.85" />
    <path class="rcard-nfc" d="${nfc1} ${nfc2}" stroke="var(--cyan, #4cc9f0)" stroke-width="0.9" stroke-linecap="round" opacity="0.85" />
    <path class="rcard-nums" d="${numsD}" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" opacity="0.85" />
    <path class="rcard-circles" d="${c1D} ${c2D}" stroke="var(--cyan, #4cc9f0)" stroke-width="0.85" stroke-linecap="round" opacity="0.9" />
  </svg>`;
}

/* ═════════ Rough.js EMV Smart Chip for Employee ID Badge ═════════ */
export function renderRoughBadgeChipSvg({ width = 48, height = 36, seed = 'emp-chip' } = {}) {
  const w = 48;
  const h = 36;
  const r = 4;
  const bodyD = roundRectD(1, 1, w - 2, h - 2, r);
  const strokeD = sketch(bodyD, `${seed}:body`, { roughness: 0.75, strokeWidth: 1.3 });
  const hachureD = sketchHachure(2, 2, w - 4, h - 4, `${seed}:hachure`, { hachureGap: 4.5, hachureAngle: -35, fillWeight: 0.8 });
  const internalLines = sketch(
    'M 18 1 V 35 M 30 1 V 35 M 1 18 H 47 M 18 10 H 30 M 18 26 H 30',
    `${seed}:grid`,
    { roughness: 0.6, strokeWidth: 1.0 }
  );

  return `<svg class="badge-emv-svg" viewBox="0 0 ${w} ${h}" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="${bodyD}" fill="var(--gold, #e5b869)" fill-opacity="0.22" />
    <path d="${hachureD}" stroke="var(--gold, #e5b869)" stroke-width="0.8" opacity="0.35" />
    <path d="${strokeD}" stroke="var(--gold, #e5b869)" stroke-width="1.3" stroke-linecap="round" />
    <path d="${internalLines}" stroke="var(--gold, #e5b869)" stroke-width="1.0" stroke-linecap="round" opacity="0.85" />
  </svg>`;
}

// Map issue categories to semantic domain accents
const CAT_DOMAIN = {
  'declined transactions': 'operations',
  'travel and foreign use': 'mechanical',
  'fraud and unauthorized transactions': 'failure',
  'lost, stolen, replacement and renewal': 'operations',
  'disputes and chargebacks': 'economics',
  'rewards and points': 'biology',
  'fees and interest': 'economics',
  'digital wallet and online': 'software',
  'account access, pin and lock': 'operations',
  'pre-authorized payments and subscriptions': 'economics',
  'limits and credit decisions': 'economics',
  'collections and hardship': 'operations',
  'product changes and closures': 'mechanical'
};

export function domainForCategory(cat = '') {
  return CAT_DOMAIN[cat.toLowerCase()] || 'software';
}

function shortText(str = '', max = 28) {
  const clean = String(str).replace(/^["'“”]+|["'“”]+$/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

/* ═════════ Miniature Rough.js Topological Blueprint for Library Cards ═════════ */
export function renderMiniTopo(issue) {
  const hasBd = !!issue.breakdown;
  const prog = store.prog(issue.id);
  const readSet = new Set(prog.read || []);

  // 6 boxes summarising the call map
  const nodes = [
    { x: 24, y: 20, w: 38, h: 16, rx: 4, step: 0 },
    { x: 24, y: 44, w: 38, h: 16, rx: 4, step: hasBd ? 2 : 1 },
    { x: 92, y: 31, w: 44, h: 18, rx: 5, step: hasBd ? 4 : 1 },
    { x: 164, y: 18, w: 46, h: 16, rx: 4, step: hasBd ? 5 : 2 },
    { x: 164, y: 44, w: 46, h: 16, rx: 4, step: hasBd ? 6 : 2 },
    { x: 238, y: 29, w: 44, h: 22, rx: 6, step: hasBd ? 7 : 3 }
  ];
  const edges = [
    [0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]
  ];

  const isUnlocked = (s) => readSet.has(s) || (readSet.size > 0 && s === 0);

  const edgeSvg = edges.map(([a, b], eIdx) => {
    const na = nodes[a], nb = nodes[b];
    const x1 = na.x + na.w, y1 = na.y + na.h / 2;
    const x2 = nb.x, y2 = nb.y + nb.h / 2;
    const mx = (x1 + x2) / 2;
    const un = isUnlocked(na.step) && isUnlocked(nb.step);
    const rawD = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
    const roughD = sketch(rawD, `${issue.id}:me:${eIdx}`, { roughness: 0.8, bowing: 0.7 });
    return `<path class="topo-edge ${un ? 'unlocked' : 'ghost'}" d="${roughD}" fill="none"/>`;
  }).join('');

  const nodeSvg = nodes.map((n, idx) => {
    const un = isUnlocked(n.step);
    const boxD = sketch(roundRectD(n.x, n.y, n.w, n.h, n.rx), `${issue.id}:mn:${idx}`, { roughness: 0.85, bowing: 0.75 });
    const hachD = un ? sketchHachure(n.x + 2, n.y + 2, n.w - 4, n.h - 4, `${issue.id}:mh:${idx}`, { hachureGap: 5.5 }) : '';
    const dot2 = idx === 2 ? `<path d="${sketch(circleD(n.x + 9, n.y + n.h / 2, 2.5), `${issue.id}:md2`)}" class="topo-dot ${un ? 'on-fail' : ''}"/>` : '';
    const dot5 = idx === 5 ? `<path d="${sketch(circleD(n.x + n.w - 9, n.y + n.h / 2, 2.8), `${issue.id}:md5`)}" class="topo-dot ${un ? 'on-acc' : ''}"/>` : '';
    return `<g class="topo-node-g ${un ? 'unlocked' : 'ghost'}">
      <rect class="topo-node-fill ${un ? 'unlocked' : 'ghost'}" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.rx}"/>
      ${hachD ? `<path class="topo-hachure" d="${hachD}"/>` : ''}
      <path class="topo-node ${un ? 'unlocked' : 'ghost'}" d="${boxD}"/>
      ${dot2}${dot5}
    </g>`;
  }).join('');

  return `<div class="bd-topo-header">
    <svg class="bd-topo-svg" viewBox="0 0 300 76" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      ${edgeSvg}
      ${nodeSvg}
    </svg>
  </div>`;
}

/* ═════════ Full interactive call map ═════════ */
// Six lanes inside the 920-unit width: 10 + 112 + 196 + 196 + 112 + 112 + 142 + five 6-unit gaps + 10.
const LANE_GEOM = [
  { x: 10, w: 112 },
  { x: 128, w: 196 },
  { x: 330, w: 196 },
  { x: 532, w: 112 },
  { x: 650, w: 112 },
  { x: 768, w: 142 }
];
const LANE_PAD = 8;

function callLanes() {
  // Full names where the lane is wide enough, short labels in the narrow ones.
  const names = ['1 Ready', '2 Welcome and Listen', '3 Solve Immediate Need', '4 Check', '5 Advise', '6 Making Their Day'];
  return LANE_GEOM.map((g, idx) => ({ idx, label: names[idx], full: `${CALL_STEPS[idx].n} ${CALL_STEPS[idx].label}`, x: g.x, w: g.w }));
}

export function buildCallGraph(issue) {
  const bd = issue.breakdown;
  const seq = callSequence(!!bd);
  const codeOf = key => seq.find(s => s.key === key)?.code || '';
  const lanes = callLanes();
  const nx = lane => LANE_GEOM[lane].x + LANE_PAD;
  const nw = lane => LANE_GEOM[lane].w - LANE_PAD * 2;
  const polCount = (bd?.policyRefs || []).length;

  // Narrow lanes stack the title under the number badge so it never runs out of the box.
  const panelNode = (key, lane, y, sub) => ({
    id: `part-${key}`, part: key, stepIdx: -1, seenKey: `seen-${key}`, lane, x: nx(lane), y, w: nw(lane), h: 70,
    kind: 'panel', stack: true, num: codeOf(key), title: PANELS[key].node, sub, tone: CALL_STEPS[lane].tone
  });

  if (bd) {
    const emoShort = shortText((bd.emotionalRead || issue.emotion || 'Tension').split(/[.:;]/)[0], 26);
    const jobShort = shortText((bd.underlyingJob || issue.underlyingJob || 'Restore continuity').split(/[.:;]/)[0], 28);
    const flagCount = (bd.riskFlags || []).length;
    const qCount = (bd.diagnose || []).length;
    const partNode = (pi, lane, y, h, kind, sub, stack = false) => ({
      id: `part-${pi}`, part: String(pi), stepIdx: pi, lane, x: nx(lane), y, w: nw(lane), h,
      kind, stack, num: codeOf(String(pi)), title: PARTS[pi][1], sub, tone: CALL_STEPS[lane].tone
    });

    const nodes = [
      panelNode('r', 0, 92, 'What to open'),
      { id: 'part-p', part: 'p', stepIdx: -2, lane: 0, x: nx(0), y: 222, w: nw(0), h: 70, kind: 'policy', stack: true, num: '§', title: 'Policy', sub: `${polCount} source${polCount === 1 ? '' : 's'}`, tone: 'slate' },

      partNode(0, 1, 52, 52, 'quote', shortText(bd.surfaceRequest, 30)),
      partNode(1, 1, 116, 52, 'job', jobShort),
      partNode(2, 1, 180, 52, 'emotion', emoShort),
      partNode(3, 1, 244, 52, 'psych', ''),
      partNode(5, 1, 308, 52, 'engage', ''),

      partNode(4, 2, 56, 58, 'flag', `${flagCount} check${flagCount === 1 ? '' : 's'}`),
      partNode(6, 2, 134, 58, 'fork', `${qCount} question${qCount === 1 ? '' : 's'}`),
      partNode(7, 2, 212, 58, 'resolve', ''),
      partNode(8, 2, 290, 58, 'script', `${(bd.sayThisNotThis || []).length} lines`),

      panelNode('c', 3, 157, 'Is it sorted?'),
      panelNode('a', 4, 157, 'Ask, advise'),

      panelNode('m', 5, 66, 'Recap and close'),
      partNode(9, 5, 157, 70, 'after', '', true),
      partNode(10, 5, 248, 70, 'lead', '', true)
    ];

    const edges = [
      { id: 'e-r-p', from: 'part-r', to: 'part-p', kind: 'policy' },
      { id: 'e-r-0', from: 'part-r', to: 'part-0', kind: 'flow' },
      { id: 'e-0-1', from: 'part-0', to: 'part-1', kind: 'signal' },
      { id: 'e-1-2', from: 'part-1', to: 'part-2', kind: 'signal' },
      { id: 'e-2-3', from: 'part-2', to: 'part-3', kind: 'signal' },
      { id: 'e-3-5', from: 'part-3', to: 'part-5', kind: 'flow' },
      { id: 'e-5-4', from: 'part-5', to: 'part-4', kind: 'guard' },
      { id: 'e-4-6', from: 'part-4', to: 'part-6', kind: 'flow' },
      { id: 'e-6-7', from: 'part-6', to: 'part-7', kind: 'flow' },
      { id: 'e-7-8', from: 'part-7', to: 'part-8', kind: 'flow' },
      { id: 'e-8-c', from: 'part-8', to: 'part-c', kind: 'flow' },
      { id: 'e-c-a', from: 'part-c', to: 'part-a', kind: 'flow' },
      { id: 'e-a-m', from: 'part-a', to: 'part-m', kind: 'flow' },
      { id: 'e-m-9', from: 'part-m', to: 'part-9', kind: 'flow' },
      { id: 'e-9-10', from: 'part-9', to: 'part-10', kind: 'lead' }
    ];

    return { width: 920, height: 384, lanes, nodes, edges, totalSteps: 11 };
  }

  // Short guide: the same six lanes, with its 4 steps in Listen and Solve
  const obsNode = (pi, lane, y, kind, title, sub) => ({
    id: `obs-${pi}`, part: String(pi), stepIdx: pi, lane, x: nx(lane), y, w: nw(lane), h: 64,
    kind, num: codeOf(String(pi)), title, sub, tone: CALL_STEPS[lane].tone
  });
  const qn = (issue.quotes || []).length;
  const nodes = [
    panelNode('r', 0, 110, 'What to open'),
    obsNode(0, 1, 62, 'quote', 'What callers report', qn ? `${qn} quote${qn === 1 ? '' : 's'}` : 'No quotes yet'),
    obsNode(1, 1, 164, 'emotion', 'What they need and feel', shortText(issue.emotion || issue.underlyingJob || 'Listen first', 26)),
    obsNode(2, 2, 62, 'policy', 'Policy to check', shortText(issue.category, 26)),
    obsNode(3, 2, 164, 'resolve', 'How to handle it', ''),
    panelNode('c', 3, 110, 'Is it sorted?'),
    panelNode('a', 4, 110, 'Ask, advise'),
    panelNode('m', 5, 110, 'Recap and close')
  ];
  const edges = [
    { id: 'eo-r-0', from: 'part-r', to: 'obs-0', kind: 'flow' },
    { id: 'eo-0-1', from: 'obs-0', to: 'obs-1', kind: 'signal' },
    { id: 'eo-1-2', from: 'obs-1', to: 'obs-2', kind: 'policy' },
    { id: 'eo-2-3', from: 'obs-2', to: 'obs-3', kind: 'flow' },
    { id: 'eo-3-c', from: 'obs-3', to: 'part-c', kind: 'flow' },
    { id: 'eo-c-a', from: 'part-c', to: 'part-a', kind: 'flow' },
    { id: 'eo-a-m', from: 'part-a', to: 'part-m', kind: 'flow' }
  ];
  return { width: 920, height: 290, lanes, nodes, edges, totalSteps: 4 };
}

function edgePath(na, nb) {
  const sameLane = na.lane === nb.lane;
  if (sameLane) {
    const x = na.x + na.w / 2;
    const y1 = na.y + na.h;
    const y2 = nb.y;
    return `M ${x} ${y1} L ${x} ${y2}`;
  }
  const x1 = na.x + na.w;
  const y1 = na.y + na.h / 2;
  const x2 = nb.x;
  const y2 = nb.y + nb.h / 2;
  // Lanes sit 22 units apart, so the curve handles stay inside the gap
  const dx = Math.max(12, (x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

let lastZoom = 1;
const ZOOMS = [0.75, 1, 1.25, 1.5, 1.85];
const READABLE_FIT = 0.9;

export function mountCallDiagram(paneEl, issue, opts = {}) {
  const graph = buildCallGraph(issue);
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
  let zoom = lastZoom;
  let activePart = String(opts.part ?? '0');

  const scrollEl = paneEl.querySelector('.diagram-scroll');
  // Pane narrower than READABLE_FIT of the map's width means FIT would make the text unreadable.
  const isNarrow = () => scrollEl.clientWidth > 0 && scrollEl.clientWidth < graph.width * READABLE_FIT;
  const capStateEl = paneEl.querySelector('.diagram-cap-state');

  // Parts are done when read; panels are done once they have been opened.
  const nodeDone = (n, readSet) => n.stepIdx >= 0 ? readSet.has(n.stepIdx) : !!(n.seenKey && store.isChecked(issue.id, n.seenKey));

  const arrowRoughD = sketch('M 0.8 1.6 L 8.5 5 L 0.8 8.4 Z', 'dg-arrow-head', { roughness: 0.55, bowing: 0.45 });

  function renderSvg() {
    const prog = store.prog(issue.id);
    const readSet = new Set(prog.read || []);

    // 1. Swimlanes: translucent glass fill + Rough.js hand-drawn perimeter
    const lanesSvg = graph.lanes.map((l, idx) => {
      const lh = graph.height - 24;
      const laneOutline = sketch(roundRectD(l.x, 12, l.w, lh, 12), `${issue.id}:lane:${idx}`, {
        roughness: 0.72,
        bowing: 0.65
      });
      const ruleD = sketch(`M ${l.x + 10} 40 H ${l.x + l.w - 10}`, `${issue.id}:lrule:${idx}`, {
        roughness: 0.65,
        bowing: 0.5
      });
      return `
        <g class="dg-lane-group">
          <rect class="dg-lane-fill ${idx % 2 === 1 ? 'alt' : ''}" x="${l.x}" y="12" width="${l.w}" height="${lh}" rx="12"/>
          <path class="dg-lane ${idx % 2 === 1 ? 'alt' : ''}" d="${laneOutline}" fill="none"/>
          <path class="dg-lane-rule" d="${ruleD}" fill="none"/>
          <text class="dg-lane-label" x="${l.x + 12}" y="31">${esc(l.label)}${l.full ? `<title>${esc(l.full)}</title>` : ''}</text>
        </g>
      `;
    }).join('');

    // 2. Edges: Rough.js hand-drawn paths preserving exact port endpoints
    const edgesSvg = graph.edges.map(e => {
      const na = nodeMap.get(e.from);
      const nb = nodeMap.get(e.to);
      if (!na || !nb) return '';
      const rawD = edgePath(na, nb);
      const roughD = sketch(rawD, `${issue.id}:${e.id}`, { roughness: 0.9, bowing: 0.85 });
      const isAct = (na.part === activePart || nb.part === activePart || activePart === 'all');
      const isDone = nodeDone(na, readSet) && nodeDone(nb, readSet);
      const cls = [
        'dg-edge',
        `dg-ekind-${e.kind}`,
        isAct ? 'dg-edge-active' : '',
        isDone ? 'dg-edge-done' : ''
      ].filter(Boolean).join(' ');

      const midX = (na.x + na.w + nb.x) / 2;
      const midY = (na.y + na.h / 2 + nb.y + nb.h / 2) / 2 - 6;
      const markerId = isAct ? 'dg-arrow-act' : isDone ? 'dg-arrow-done' : 'dg-arrow';

      return `<g class="${cls}" data-edge="${e.id}" data-from="${e.from}" data-to="${e.to}">
        <path class="dg-epath" d="${roughD}" fill="none" marker-end="url(#${markerId})"/>
        ${isAct ? `<path class="dg-epath-flow" d="${rawD}" fill="none"/>` : ''}
        ${e.label && na.lane !== nb.lane ? `<text class="dg-elabel" x="${midX}" y="${midY}" text-anchor="middle">${esc(e.label)}</text>` : ''}
      </g>`;
    }).join('');

    // 3. Nodes: Two-pass rendering (crisp liquid-glass .dg-fill + Rough.js .dg-shape, hachure, badge & corner glyph)
    const nodesSvg = graph.nodes.map(n => {
      const isCur = n.part === activePart || (activePart === 'all');
      const isDone = nodeDone(n, readSet);
      const stateCls = isCur ? 'dg-node-active' : isDone ? 'dg-node-done' : 'dg-node-todo';

      const shapeD = sketch(roundRectD(0, 0, n.w, n.h, 10), `${issue.id}:${n.id}:box`);
      const haloD = isCur
        ? sketch(roundRectD(-4, -4, n.w + 8, n.h + 8, 13), `${issue.id}:${n.id}:halo`, { roughness: 1.15, bowing: 0.95 })
        : '';
      const hachD = (isCur || isDone)
        ? sketchHachure(3, 3, n.w - 6, n.h - 6, `${issue.id}:${n.id}:hach`, { hachureGap: isCur ? 6 : 8 })
        : '';
      const badgeD = sketch(roundRectD(10, 10, 25, 18, 5), `${issue.id}:${n.id}:badge`, { roughness: 0.72, bowing: 0.6 });

      const doneCheckD = isDone
        ? sketch(`M ${n.w - 17} 16 L ${n.w - 14.8} 18.2 L ${n.w - 11} 14`, `${issue.id}:${n.id}:chk`, { roughness: 0.5, bowing: 0.4 })
        : '';

      const stepNo = n.lane + 1;
      const stepName = CALL_STEPS[n.lane]?.label || '';
      const toneVar = TONE_VAR[n.tone];
      // Stacked nodes put the title under the badge; the rest keep it beside the badge.
      const tx = n.stack ? 12 : 41, ty = n.stack ? 45 : 23, sy = n.stack ? 60 : 44;

      return `<g class="dg-node ${stateCls} tone-${n.tone}"${toneVar ? ` style="--node-tone:${toneVar}"` : ''} data-node="${n.id}" data-part="${n.part}" transform="translate(${n.x},${n.y})" role="button" tabindex="0" aria-label="${esc(`${n.part === 'p' ? '' : `Step ${stepNo}, ${stepName}: `}${n.title}`)}">
        ${haloD ? `<path class="dg-halo" d="${haloD}" fill="none"/>` : ''}
        <rect class="dg-fill" x="0" y="0" width="${n.w}" height="${n.h}" rx="10"/>
        ${hachD ? `<path class="dg-hachure" d="${hachD}" fill="none"/>` : ''}
        <path class="dg-shape" d="${shapeD}" fill="none"/>
        <rect class="dg-badge-fill" x="10" y="10" width="25" height="18" rx="5"/>
        <path class="dg-badge-bg" d="${badgeD}" fill="none"/>
        <text class="dg-badge-txt" x="22.5" y="22.5" text-anchor="middle">${esc(n.num)}</text>
        ${isDone ? `<circle class="dg-done-dot" cx="${n.w - 14}" cy="16" r="5.5"/><path d="${doneCheckD}" fill="none" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round"/>` : ''}
        <text class="dg-title" x="${tx}" y="${ty}">${esc(n.title)}</text>
        <text class="dg-sub" x="12" y="${sy}">${esc(n.sub)}</text>
      </g>`;
    }).join('');

    // FIT shrinks the map to the pane, but a phone pane is about 350px against a
    // 920-unit map, which renders the labels at about 4px. Below the readable
    // floor FIT keeps the map at 1:1 and pans to the current step instead.
    const narrow = isNarrow();
    const fitMax = zoom === 1 && !narrow ? '100%' : 'none';
    scrollEl.innerHTML = `<svg class="dg-svg" viewBox="0 0 ${graph.width} ${graph.height}" style="--z:${zoom};width:${Math.round(graph.width * zoom)}px;max-width:${fitMax};height:auto">
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="${arrowRoughD}" class="dg-arrow-muted"/>
        </marker>
        <marker id="dg-arrow-act" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="${arrowRoughD}" class="dg-arrow-active"/>
        </marker>
        <marker id="dg-arrow-done" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="${arrowRoughD}" class="dg-arrow-done"/>
        </marker>
      </defs>
      ${lanesSvg}
      ${edgesSvg}
      ${nodesSvg}
    </svg>`;

    scrollEl.querySelectorAll('.dg-node').forEach(el => {
      el.addEventListener('click', ev => {
        ev.stopPropagation();
        const p = el.dataset.part;
        if (opts.onSelectPart) opts.onSelectPart(p);
      });
      el.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      });
      el.addEventListener('pointerenter', () => {
        const p = el.dataset.part;
        document.querySelectorAll(`[data-spot-part="${p}"]`).forEach(c => c.classList.add('card-reverse-highlight'));
      });
      el.addEventListener('pointerleave', () => {
        document.querySelectorAll('.card-reverse-highlight').forEach(c => c.classList.remove('card-reverse-highlight'));
      });
    });

    updateCaption();
  }

  function updateCaption() {
    if (!capStateEl) return;
    const prog = store.prog(issue.id);
    const readCount = (prog.read || []).filter(x => x >= 0 && x < graph.totalSteps).length;
    const unit = graph.totalSteps === 11 ? 'parts' : 'steps';
    const st = stepForKey(activePart, !!issue.breakdown);
    if (activePart === 'all') {
      capStateEl.textContent = `The whole call in order: ${readCount} of ${graph.totalSteps} ${unit} read`;
    } else if (activePart === 'o') {
      { const qn = (issue.quotes || []).length; capStateEl.textContent = `What callers report: ${qn} quote${qn === 1 ? '' : 's'}`; }
    } else if (activePart === 'p') {
      capStateEl.textContent = 'Policy for this issue. Confirm in your systems before quoting.';
    } else if (st) {
      capStateEl.textContent = `Step ${st.n} of 6: ${st.label}. ${readCount} of ${graph.totalSteps} ${unit} read`;
    }
  }

  function setPart(part) {
    activePart = String(part);
    renderSvg();
    requestAnimationFrame(centerActive);
  }

  // Centre the active node by scrolling only the diagram container (never the page)
  function centerActive() {
    const n = scrollEl.querySelector('.dg-node-active');
    if (!n) return;
    const r = n.getBoundingClientRect(), s = scrollEl.getBoundingClientRect();
    if (scrollEl.scrollWidth > scrollEl.clientWidth + 4) scrollEl.scrollLeft += (r.left + r.width / 2) - (s.left + s.width / 2);
    if (scrollEl.scrollHeight > scrollEl.clientHeight + 4) scrollEl.scrollTop += (r.top + r.height / 2) - (s.top + s.height / 2);
  }

  function spotlight(partKey, on = true) {
    const svg = scrollEl.querySelector('.dg-svg');
    if (!svg) return;
    svg.classList.toggle('dg-has-spot-preview', on && partKey != null);
    svg.querySelectorAll('.dg-spot-preview').forEach(el => el.classList.remove('dg-spot-preview'));
    if (on && partKey != null) {
      svg.querySelectorAll(`.dg-node[data-part="${partKey}"]`).forEach(el => el.classList.add('dg-spot-preview'));
    }
  }

  function syncFit() {
    const fitBtn = paneEl.querySelector('[data-zoom="fit"]');
    if (fitBtn) {
      fitBtn.textContent = zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}% ↺`;
      fitBtn.classList.toggle('on', zoom === 1);
    }
  }

  function setZoom(z) {
    zoom = z;
    lastZoom = z;
    renderSvg();
    syncFit();
    requestAnimationFrame(centerActive);
  }

  function stepZoom(d) {
    const i = ZOOMS.indexOf(zoom);
    const j = Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? 1 : i) + d));
    setZoom(ZOOMS[j]);
  }

  // Wire zoom buttons
  paneEl.querySelector('[data-zoom="out"]')?.addEventListener('click', () => stepZoom(-1));
  paneEl.querySelector('[data-zoom="in"]')?.addEventListener('click', () => stepZoom(1));
  paneEl.querySelector('[data-zoom="fit"]')?.addEventListener('click', () => setZoom(1));

  renderSvg();
  syncFit();
  requestAnimationFrame(centerActive);

  // Re-render only when the pane crosses the readable floor (rotation, split drag, resize).
  let wasNarrow = isNarrow();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (!scrollEl.isConnected) return;
      const n = isNarrow();
      if (n === wasNarrow) return;
      wasNarrow = n;
      renderSvg();
      requestAnimationFrame(centerActive);
    }).observe(scrollEl);
  }

  return {
    setPart,
    spotlight,
    refresh: renderSvg
  };
}

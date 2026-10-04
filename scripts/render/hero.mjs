// Hero — the profile's console. A target frame locks onto the chrome wordmark,
// beside an isometric GPGPU package: compute units fire in diagonal waves, HBM
// stacks feed the die, and tokens rise off it. The HUD runs a validation suite.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, linear, glowFill, corners, pill, rich, emphasize, statusDot, fmt } from '../theme.mjs';

const W = 860;
const H = 360;
const P = ([x, y]) => `${f(x)} ${f(y)}`;

export function hero(ts, t, { config, data }) {
  const doc = new Doc(ts, {
    width: W,
    height: H,
    title: `${config.wordmark} — ${config.tagline}`,
    desc: `${config.taglineEn} ${config.disciplines.join(' · ')}`,
  });
  const dark = t.name === 'dark';
  const { back, front, clip } = frame(doc, t, {
    glows: [
      { cx: 690, cy: 130, rx: 360, ry: 270, color: t.aurora.violet, o: dark ? 0.5 : 0.85, drift: [-34, 16], dur: 26 },
      { cx: 140, cy: 400, rx: 420, ry: 250, color: t.aurora.cyan, o: dark ? 0.3 : 0.8, drift: [46, -24], dur: 31 },
      { cx: 520, cy: 420, rx: 260, ry: 170, color: t.aurora.rose, o: dark ? 0.2 : 0.6, drift: [-28, -26], dur: 23 },
    ],
    fade: [0.55, 0.5, 0.72],
  });

  return doc.render(
    [
      back,
      corners(t, { x: 16, y: 16, w: W - 32, h: H - 32, len: 18, color: t.ink, opacity: 0.45 }),
      hud(doc, t, config, data),
      chip(doc, t),
      precision(doc, t),
      identity(doc, t, config, data),
      el('g', { 'clip-path': `url(#${clip})` }, scanline(doc, t)),
      front,
    ].join('\n'),
  );
}

function hud(doc, t, config, data) {
  const y = 46;
  const mono = { size: 10, stack: 'mono', tracking: 0.12 };
  const out = [
    statusDot(doc, t, { cx: 44, cy: y - 3.6, r: 3.4 }),
    doc.text('LIVE', { x: 54, y, ...mono, stack: 'monoMd', fill: t.ink2 }),
    el('rect', { x: 92, y: y - 9, width: 1, height: 10, fill: t.line3 }),
    doc.text(`${config.wordmark}.SYS  //  BUILD ${data.syncedAt.slice(0, 7).replace('-', '.')}`, { x: 104, y, ...mono, fill: t.ink3 }),
  ];
  // Validation suite: functional, accuracy, performance and stability checks
  // light up in sequence, hold, then re-run.
  doc.css('.vl{animation:vl 7s ease-in-out infinite}@keyframes vl{0%{opacity:.2}6%,78%{opacity:1}88%,to{opacity:.2}}');
  const checks = ['STAB', 'PERF', 'ACC', 'FUNC'];
  let x = W - 40;
  checks.forEach((c, i) => {
    out.push(doc.text(c, { x, y, ...mono, fill: t.ink3, anchor: 'end' }));
    x -= doc.ts.measure(c, mono) + 10;
    out.push(el('circle', { cx: x + 3, cy: y - 3.6, r: 3, fill: t.signal, class: 'vl', style: `animation-delay:${f((checks.length - 1 - i) * 0.45)}s` }));
    x -= 18;
  });
  out.push(doc.text('VALIDATION', { x: x - 4, y, ...mono, fill: t.ink4, anchor: 'end' }));
  return out.join('');
}

function identity(doc, t, config, data) {
  const dark = t.name === 'dark';
  const x = 44;
  const base = 170;
  const size = 62;
  const name = doc.ts.path(config.wordmark, { x, y: base, size, stack: 'display', tracking: 0.05 });
  const cap = doc.ts.capHeight('display', size);
  const top = base - cap;
  const out = [];

  // Liquid-chrome wordmark with a specular sweep clipped to the letterforms.
  const chrome = linear(doc, t.chrome, { x1: 0, y1: f(top), x2: 0, y2: base, units: 'userSpaceOnUse' });
  out.push(el('path', { d: name.d, fill: `url(#${chrome})` }));
  const nameClip = doc.uid('nc');
  doc.def(`<clipPath id="${nameClip}"><path d="${name.d}"/></clipPath>`);
  const sweep = linear(doc, [[0, '#fff', 0], [0.5, '#fff', dark ? 0.9 : 0.75], [1, '#fff', 0]]);
  doc.css(`.sh{animation:sh 7s cubic-bezier(.6,0,.4,1) 1.4s infinite}@keyframes sh{0%{transform:translateX(0)}24%,to{transform:translateX(${f(name.width + 190)}px)}}`);
  const sx = x - 110;
  out.push(el('g', { 'clip-path': `url(#${nameClip})` }, el('path', { class: 'sh', fill: `url(#${sweep})`, d: `M${sx + 26} ${top - 12}h64l-26 ${cap + 24}h-64z` })));

  // Target frame: dashed bounds, lock-on corner brackets and the role chip.
  const pad = 14;
  const box = { x: x - pad, y: top - pad - 2, w: name.width + pad * 2, h: cap + pad * 2 + 2 };
  doc.css('.lk{transform-box:fill-box;transform-origin:center;animation:lk .9s cubic-bezier(.2,.8,.2,1) .3s backwards}@keyframes lk{from{transform:scale(1.14);opacity:.3}}');
  out.push(el('rect', { x: f(box.x), y: f(box.y), width: f(box.w), height: f(box.h), fill: 'none', stroke: t.cyan, 'stroke-opacity': 0.35, 'stroke-dasharray': '2 4' }));
  out.push(el('g', { class: 'lk' }, corners(t, { ...box, len: 12, color: t.cyan, sw: 2 })));
  const chipText = { size: 9.5, stack: 'monoMd', tracking: 0.08 };
  out.push(el('rect', { x: f(box.x - 1), y: f(box.y - 19), width: f(doc.ts.measure(config.badge, chipText) + 14), height: 18, fill: t.cyan }));
  out.push(doc.text(config.badge, { x: box.x + 6, y: box.y - 6.5, ...chipText, fill: t.chipInk }));

  out.push(rich(doc, t, emphasize(config.tagline, config.emphasis), { x: x + 1, y: 230, size: 22, stack: 'cjk', tracking: 0.12 }).svg);

  // Disciplines, separated by brand-violet interpuncts.
  const mono = { size: 10, stack: 'mono', tracking: 0.13 };
  let dx = x + 1;
  config.disciplines.forEach((d, i) => {
    if (i) {
      out.push(doc.text('·', { x: dx + 6, y: 258, ...mono, fill: t.violet2 }));
      dx += 20;
    }
    out.push(doc.text(d, { x: dx, y: 258, ...mono, fill: t.ink3 }));
    dx += doc.ts.measure(d, mono);
  });

  let px = x;
  for (const p of [
    { parts: [{ text: `${config.location.city} · ${config.location.tz}` }], dot: t.signal },
    { parts: [{ text: fmt(data.contributions.total), stack: 'monoMd', fill: t.ink }, { text: 'CONTRIBUTIONS · 12 MO', fill: t.ink3 }] },
    { parts: [{ text: config.handle }] },
  ]) {
    const pl = pill(doc, t, { x: px, y: 288, ...p });
    out.push(pl.svg);
    px += pl.w + 8;
  }
  return out.join('');
}

/* ── isometric GPGPU package ───────────────────────────────────────────── */

const O = { x: 680, y: 184 };
const K = 1.4; // px per world unit
const iso = (u, v, z = 0) => [O.x + (u - v) * 0.866 * K, O.y + (u + v) * 0.5 * K - z * K];
const quad = (pts) => `M${pts.map((p) => P(iso(...p))).join('L')}Z`;
// Affine map of the plane at height z, for drawing flat on a surface.
const plane = (z) => `matrix(${f(0.866 * K)} ${f(0.5 * K)} ${f(-0.866 * K)} ${f(0.5 * K)} ${O.x} ${f(O.y - z * K)})`;

// A box seen from the +u/+v/+z corner: only its top, +u and +v faces show.
function slab([u0, v0, u1, v1], z0, z1, [top, right, left], edge) {
  return [
    el('path', { d: quad([[u1, v0, z0], [u1, v1, z0], [u1, v1, z1], [u1, v0, z1]]), fill: right }),
    el('path', { d: quad([[u0, v1, z0], [u1, v1, z0], [u1, v1, z1], [u0, v1, z1]]), fill: left }),
    el('path', { d: quad([[u0, v0, z1], [u1, v0, z1], [u1, v1, z1], [u0, v1, z1]]), fill: top, stroke: edge, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }),
  ].join('');
}

// The package stays a dark physical object in both themes, like a product shot.
const PALETTE = {
  substrate: ['#191C29', '#10121B', '#0B0C13'],
  interposer: ['#20243A', '#151827', '#10121D'],
  die: ['#2A2456', '#16172C', '#101124'],
  hbm: ['#272C40', '#191C2A', '#13151F'],
  cu: '#2C3256',
};

function chip(doc, t) {
  const dark = t.name === 'dark';
  const edge = dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.22)';
  const out = [
    el('ellipse', { cx: O.x, cy: O.y + 46, rx: 200, ry: 84, fill: glowFill(doc, t.violet, dark ? 0.45 : 0.3) }),
    el('ellipse', { cx: O.x, cy: O.y + 14, rx: 110, ry: 46, fill: glowFill(doc, t.cyan, dark ? 0.22 : 0.16) }),
  ];

  // Substrate with contact detailing, pin-1 marker and a printed part label.
  out.push(slab([-62, -62, 62, 62], 0, 6, PALETTE.substrate, edge));
  const pads = [];
  for (let k = 0; k < 14; k++) {
    const s = -54 + k * 8.3;
    for (const [u, v] of [[s, -58.5], [s, 56], [-58.5, s], [56, s]]) pads.push(quad([[u, v, 6], [u + 2.5, v, 6], [u + 2.5, v + 2.5, 6], [u, v + 2.5, 6]]));
  }
  out.push(el('path', { d: pads.join(''), fill: '#C9A76A', opacity: dark ? 0.5 : 0.65 }));
  out.push(el('path', { d: quad([[-57, -57, 6], [-52, -57, 6], [-57, -52, 6]]), fill: t.ink3 }));
  out.push(el('g', { transform: plane(6), opacity: 0.55 }, doc.text('GPGPU · LLM INFERENCE', { x: -44, y: 52, size: 4.6, stack: 'monoMd', fill: '#fff', tracking: 0.18 })));

  // Interposer and its die ↔ HBM traces.
  out.push(slab([-50, -50, 50, 50], 6, 9, PALETTE.interposer, edge));
  doc.css('.bus{animation:bus 1.8s ease-in-out infinite}@keyframes bus{50%{opacity:.25}}');
  let traces = '';
  for (const side of [-1, 1]) {
    for (const v of [-22, -17, -12, -7, 7, 12, 17, 22]) {
      const [a, b] = side < 0 ? [-27, -18] : [18, 27];
      traces += `M${P(iso(a, v, 9))}L${P(iso(b, v, 9))}`;
    }
  }
  out.push(el('path', { d: traces, stroke: t.cyan, 'stroke-width': 0.9, 'stroke-opacity': 0.55, class: 'bus' }));

  // Die and HBM stacks, painted back to front.
  const parts = [
    { box: [-46, -26, -27, -4], kind: 'hbm' },
    { box: [-46, 4, -27, 26], kind: 'hbm' },
    { box: [-18, -18, 18, 18], kind: 'die' },
    { box: [27, -26, 46, -4], kind: 'hbm' },
    { box: [27, 4, 46, 26], kind: 'hbm' },
  ].sort((a, b) => a.box.reduce((s, n) => s + n, 0) - b.box.reduce((s, n) => s + n, 0));
  for (const p of parts) out.push(p.kind === 'die' ? die(doc, t, p.box, edge) : hbm(p.box, edge));

  out.push(tokens(doc, t));
  return out.join('');
}

function hbm([u0, v0, u1, v1], edge) {
  let seams = '';
  for (const z of [11.5, 14, 16.5]) seams += `M${P(iso(u1, v0, z))}L${P(iso(u1, v1, z))}L${P(iso(u0, v1, z))}`;
  return slab([u0, v0, u1, v1], 9, 19, PALETTE.hbm, edge) + el('path', { d: seams, fill: 'none', stroke: '#000', 'stroke-opacity': 0.45, 'stroke-width': 0.8 });
}

function die(doc, t, box, edge) {
  const z = 13;
  const out = [slab(box, 9, z, PALETTE.die, edge)];
  // 6×6 compute units; a diagonal wave of activity sweeps across them.
  doc.css('.cu{opacity:.08;animation:cu 3.4s ease-in-out infinite}@keyframes cu{0%,100%{opacity:.08}18%{opacity:.92}42%{opacity:.08}}');
  const n = 6;
  const gap = 1.2;
  const c = (31 - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const u = -15.5 + i * (c + gap);
      const v = -15.5 + j * (c + gap);
      const d = quad([[u, v, z], [u + c, v, z], [u + c, v + c, z], [u, v + c, z]]);
      out.push(el('path', { d, fill: PALETTE.cu }));
      out.push(el('path', { d, fill: (i + j) % 5 === 2 ? t.violet2 : t.cyan, class: 'cu', style: `animation-delay:${f((i + j) * 0.14)}s` }));
    }
  }
  const [x0, y0] = iso(box[0], box[1], z);
  const [x1, y1] = iso(box[2], box[3], z);
  const sheen = linear(doc, [[0, '#fff', 0.16], [0.55, '#fff', 0], [1, '#fff', 0.04]], { x1: f(x0), y1: f(y0), x2: f(x1), y2: f(y1), units: 'userSpaceOnUse' });
  out.push(el('path', { d: quad([[box[0], box[1], z], [box[2], box[1], z], [box[2], box[3], z], [box[0], box[3], z]]), fill: `url(#${sheen})` }));
  return out.join('');
}

// Tokens rising off the die — the output of every forward pass.
function tokens(doc, t) {
  doc.css('.tk{opacity:0;animation:tk 3.6s ease-out infinite}@keyframes tk{0%{transform:translateY(0);opacity:0}15%{opacity:.95}100%{transform:translateY(-58px);opacity:0}}');
  const [cx, cy] = iso(0, 0, 13);
  return [[-7, 0], [5, 0.6], [-1, 1.2], [9, 1.8], [-10, 2.4], [3, 3]]
    .map(([dx, delay], i) =>
      el('rect', { x: f(cx + dx - 4.5), y: f(cy - 8), width: 9, height: 4.5, rx: 2.2, fill: i % 2 ? t.violet2 : t.cyan, class: 'tk', style: `animation-delay:${delay}s` }),
    )
    .join('');
}

// Precision formats under test; the marker steps through them.
function precision(doc, t) {
  const y = 318;
  const labels = ['FP32', 'BF16', 'FP16', 'FP8', 'INT8'];
  const step = 40;
  const xs = labels.map((_, i) => O.x + (i - 2) * step);
  const out = [el('rect', { x: xs[0] - 14, y: y - 0.5, width: xs.at(-1) - xs[0] + 28, height: 1, fill: t.line3 })];
  xs.forEach((x, i) => {
    out.push(el('rect', { x: f(x - 0.6), y: y - 3, width: 1.2, height: 6, fill: t.ink3 }));
    out.push(doc.text(labels[i], { x, y: y + 17, size: 8.5, stack: 'mono', fill: t.ink3, anchor: 'middle', tracking: 0.06 }));
  });
  out.push(doc.text('PRECISION', { x: xs[0] - 24, y: y + 17, size: 8.5, stack: 'mono', fill: t.ink4, anchor: 'end', tracking: 0.12 }));
  const kf = xs.map((x, i) => `${i * 20}%,${i * 20 + 14}%{transform:translateX(${f(x - O.x)}px)}`).join('');
  doc.css(`.pm{animation:pm 10s cubic-bezier(.65,0,.35,1) infinite}@keyframes pm{${kf}to{transform:translateX(${f(xs[0] - O.x)}px)}}`);
  out.push(el('path', { d: `M${O.x - 3.5} ${y - 11}h7l-3.5 4.5z`, fill: t.signal, class: 'pm' }));
  return out.join('');
}

function scanline(doc, t) {
  const dark = t.name === 'dark';
  doc.css(
    '.scan{opacity:0;animation:scan 9s cubic-bezier(.5,0,.5,1) 2s infinite}' +
      '@keyframes scan{0%{transform:translateX(-80px);opacity:0}3%{opacity:1}36%{opacity:1}40%,to{transform:translateX(940px);opacity:0}}',
  );
  const trail = linear(doc, [[0, t.cyan, 0], [1, t.cyan, dark ? 0.14 : 0.1]]);
  const beamV = linear(doc, [[0, t.cyan, 0], [0.5, t.cyan, 0.95], [1, t.cyan, 0]], { x2: 0, y2: 1 });
  return el('g', { class: 'scan' }, [
    el('rect', { x: -90, y: 0, width: 90, height: H, fill: `url(#${trail})` }),
    el('rect', { x: -1, y: 0, width: 1.5, height: H, fill: `url(#${beamV})` }),
  ]);
}

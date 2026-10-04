// Hero — the profile's viewfinder. A machine-vision HUD locks a detection box on
// the chrome wordmark, next to a lens whose seven-blade aperture breathes.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, linear, brand, glowFill, corners, pill, rich, emphasize, fmt } from '../theme.mjs';

const W = 860;
const H = 360;
const C = { x: 676, y: 186 };

const pt = (r, deg, c = C) => [c.x + r * Math.cos((deg * Math.PI) / 180), c.y + r * Math.sin((deg * Math.PI) / 180)];
const P = ([x, y]) => `${f(x)} ${f(y)}`;
const arc = (r, a0, a1) => `M${P(pt(r, a0))}A${r} ${r} 0 0 1 ${P(pt(r, a1))}`;

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
      { cx: 690, cy: 120, rx: 360, ry: 280, color: t.aurora.violet, o: dark ? 0.5 : 0.85, drift: [-34, 16], dur: 26 },
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
      lens(doc, t),
      exposure(doc, t),
      identity(doc, t, config, data),
      el('g', { 'clip-path': `url(#${clip})` }, scanline(doc, t)),
      front,
    ].join('\n'),
  );
}

function hud(doc, t, config, data) {
  doc.css('.rec{animation:rec 1.6s ease-in-out infinite}@keyframes rec{50%{opacity:.15}}');
  const y = 46;
  const mono = { size: 10, stack: 'mono', tracking: 0.12 };
  const out = [
    el('circle', { cx: 44, cy: y - 3.6, r: 3.6, fill: t.rec, class: 'rec' }),
    doc.text('REC', { x: 54, y, ...mono, stack: 'monoMd', fill: t.ink2 }),
    el('rect', { x: 88, y: y - 9, width: 1, height: 10, fill: t.line3 }),
    doc.text(`${config.wordmark}.SYS  //  BUILD ${data.syncedAt.slice(0, 7).replace('-', '.')}`, { x: 100, y, ...mono, fill: t.ink3 }),
  ];
  // Camera exposure readout, right-aligned; AF-C glows "focus confirmed" green.
  let x = W - 40;
  for (const [s, c] of [['2.39:1', t.ink3], ['1/250s', t.ink3], ['F/1.8', t.ink3], ['ISO 100', t.ink3], ['AF-C', t.signal]]) {
    out.push(doc.text(s, { x, y, ...mono, fill: c, anchor: 'end' }));
    x -= doc.ts.measure(s, mono) + 20;
  }
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
  const travel = f(name.width + 190);
  doc.css(`.sh{animation:sh 7s cubic-bezier(.6,0,.4,1) 1.4s infinite}@keyframes sh{0%{transform:translateX(0)}24%,to{transform:translateX(${travel}px)}}`);
  const sx = x - 110;
  out.push(
    el('g', { 'clip-path': `url(#${nameClip})` },
      el('path', { class: 'sh', fill: `url(#${sweep})`, d: `M${sx + 26} ${top - 12}h64l-26 ${cap + 24}h-64z` })),
  );

  // Detection box: dashed bounds, lock-on corner brackets, YOLO-style label.
  const pad = 14;
  const box = { x: x - pad, y: top - pad - 2, w: name.width + pad * 2, h: cap + pad * 2 + 2 };
  doc.css('.lk{transform-box:fill-box;transform-origin:center;animation:lk .9s cubic-bezier(.2,.8,.2,1) .3s backwards}@keyframes lk{from{transform:scale(1.14);opacity:.3}}');
  out.push(el('rect', { ...rect(box), fill: 'none', stroke: t.cyan, 'stroke-opacity': 0.35, 'stroke-dasharray': '2 4' }));
  out.push(el('g', { class: 'lk' }, corners(t, { ...box, len: 12, color: t.cyan, sw: 2 })));

  const chip = { size: 9.5, stack: 'monoMd', tracking: 0.04 };
  const labelW = doc.ts.measure(`${config.detection} 0.998`, chip);
  out.push(el('rect', { x: box.x - 1, y: box.y - 19, width: labelW + 14, height: 18, fill: t.cyan }));
  const ly = box.y - 6.5;
  out.push(doc.text(config.detection, { x: box.x + 6, y: ly, ...chip, fill: t.chipInk }));
  // The confidence score flickers between frames, like live inference.
  const confX = box.x + 6 + doc.ts.measure(`${config.detection} `, chip);
  doc.css(
    '.cf0{animation:cf0 4.2s linear infinite}.cf1{opacity:0;animation:cf1 4.2s linear infinite}.cf2{opacity:0;animation:cf2 4.2s linear infinite}' +
      '@keyframes cf0{0%,32%{opacity:1}33%,to{opacity:0}}@keyframes cf1{0%,32%{opacity:0}33%,65%{opacity:1}66%,to{opacity:0}}@keyframes cf2{0%,65%{opacity:0}66%,99%{opacity:1}}',
  );
  ['0.998', '0.996', '0.999'].forEach((v, i) => out.push(el('g', { class: `cf${i}` }, doc.text(v, { x: confX, y: ly, ...chip, fill: t.chipInk }))));
  out.push(doc.text('TRK·01', { x: box.x + box.w, y: box.y - 6.5, size: 9, stack: 'mono', fill: t.ink3, tracking: 0.12, anchor: 'end' }));

  // Tagline with the two verbs in the brand gradient.
  out.push(
    rich(doc, t, emphasize(config.tagline, config.emphasis), {
      x: x + 1,
      y: 230,
      size: 22,
      stack: 'cjk',
      tracking: 0.16,
    }).svg,
  );

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

  // Status capsules.
  let px = x;
  for (const p of [
    { parts: [{ text: 'SYSTEM ONLINE' }], dot: t.signal },
    { parts: [{ text: fmt(data.contributions.total), stack: 'monoMd', fill: t.ink }, { text: 'CONTRIBUTIONS · 12 MO', fill: t.ink3 }] },
    { parts: [{ text: config.handle }] },
  ]) {
    const pl = pill(doc, t, { x: px, y: 288, ...p });
    out.push(pl.svg);
    px += pl.w + 8;
  }
  return out.join('');
}

const rect = (b) => ({ x: f(b.x), y: f(b.y), width: f(b.w), height: f(b.h) });

/* ── lens ──────────────────────────────────────────────────────────────── */

function lens(doc, t) {
  const dark = t.name === 'dark';
  doc.css(
    `.rot{transform-origin:${C.x}px ${C.y}px;animation:rot 120s linear infinite}` +
      `.rot2{transform-origin:${C.x}px ${C.y}px;animation:rot 70s linear infinite reverse}` +
      `.orb{transform-origin:${C.x}px ${C.y}px;animation:rot 16s linear infinite}` +
      `.core{transform-origin:${C.x}px ${C.y}px;animation:core 5s ease-in-out infinite alternate}` +
      '@keyframes rot{to{transform:rotate(360deg)}}@keyframes core{to{transform:scale(1.07)}}',
  );
  const out = [el('circle', { cx: C.x, cy: C.y, r: 200, fill: glowFill(doc, t.violet, dark ? 0.32 : 0.2) })];

  // Focus-ring scale: 60 ticks, a major one every 30°.
  let major = '';
  let minor = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    const seg = `M${P(pt(i % 5 ? 118.5 : 115, a))}L${P(pt(122, a))}`;
    if (i % 5) minor += seg;
    else major += seg;
  }
  out.push(
    el('g', { class: 'rot' }, [
      el('path', { d: minor, stroke: t.ink4, 'stroke-width': 1 }),
      el('path', { d: major, stroke: t.ink3, 'stroke-width': 1.4 }),
    ]),
  );
  out.push(el('circle', { cx: C.x, cy: C.y, r: 112, fill: 'none', stroke: t.line3, 'stroke-dasharray': '1.5 5.2', class: 'rot2' }));
  out.push(
    el('g', { class: 'orb' }, [
      el('circle', { cx: C.x + 112, cy: C.y, r: 8, fill: glowFill(doc, t.cyan, 0.55) }),
      el('circle', { cx: C.x + 112, cy: C.y, r: 2.4, fill: t.cyan }),
    ]),
  );

  // Coated glass ring and the barrel.
  out.push(el('circle', { cx: C.x, cy: C.y, r: 101, fill: 'none', stroke: `url(#${brand(doc, t, { x2: 1, y2: 1 })})`, 'stroke-width': 9, 'stroke-opacity': dark ? 0.22 : 0.3 }));
  out.push(el('circle', { cx: C.x, cy: C.y, r: 105.5, fill: 'none', stroke: t.line2 }));
  out.push(el('circle', { cx: C.x, cy: C.y, r: 96.5, fill: 'none', stroke: t.line2 }));
  out.push(el('circle', { cx: C.x, cy: C.y, r: 94, fill: t.lens.rim }));

  // The "eye" seen through the aperture.
  const core = doc.uid('cg');
  const cs = t.lens.core;
  doc.def(
    `<radialGradient id="${core}" cx=".5" cy=".5" r=".5" fx=".42" fy=".38">` +
      [[0, cs[0]], [0.16, '#7DEBFA'], [0.3, cs[1]], [0.52, cs[2]], [0.76, cs[3]], [1, cs[4]]].map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') +
      '</radialGradient>',
  );
  out.push(el('circle', { cx: C.x, cy: C.y, r: 90, fill: `url(#${core})`, class: 'core' }));
  out.push(aperture(doc, t));

  // Reticle, coating reflections and rim light.
  out.push(
    el('path', {
      d: `M${C.x - 8} ${C.y}h5M${C.x + 3} ${C.y}h5M${C.x} ${C.y - 8}v5M${C.x} ${C.y + 3}v5`,
      stroke: '#fff', 'stroke-opacity': 0.75, 'stroke-width': 1.2,
    }),
  );
  const reflect = { fill: 'none', stroke: '#fff', 'stroke-linecap': 'round' };
  out.push(el('path', { d: arc(76, 196, 246), ...reflect, 'stroke-opacity': 0.34, 'stroke-width': 2.4 }));
  out.push(el('path', { d: arc(65, 204, 222), ...reflect, 'stroke-opacity': 0.16, 'stroke-width': 1.4 }));
  out.push(el('ellipse', { cx: C.x + 36, cy: C.y + 30, rx: 9, ry: 3, transform: `rotate(-40 ${C.x + 36} ${C.y + 30})`, fill: t.signal, opacity: 0.1 }));
  out.push(el('ellipse', { cx: C.x + 26, cy: C.y - 42, rx: 7, ry: 2.6, transform: `rotate(28 ${C.x + 26} ${C.y - 42})`, fill: '#C4B5FD', opacity: 0.32 }));
  const rim = linear(doc, [[0, '#fff', dark ? 0.4 : 0.55], [0.5, '#fff', 0], [1, '#fff', 0.08]], { x2: 1, y2: 1 });
  out.push(el('circle', { cx: C.x, cy: C.y, r: 93.5, fill: 'none', stroke: `url(#${rim})`, 'stroke-width': 1.2 }));

  // Crosshair ticks outside the focus ring.
  out.push(el('path', { d: [0, 90, 180].map((a) => `M${P(pt(130, a))}L${P(pt(142, a))}`).join(''), stroke: t.ink3, 'stroke-width': 1.2 }));
  return out.join('');
}

// Seven blades tiling the annulus between the opening polygon and the barrel.
// Blade k is the exterior wedge at opening vertex V_k; SMIL morphs the opening.
function bladeGeometry(rho, phase, N = 7, R = 92) {
  const V = Array.from({ length: N }, (_, k) => pt(rho, phase + (k * 360) / N));
  const E = V.map((v, k) => {
    const w = V[(k + 1) % N];
    const D = [w[0] - v[0], w[1] - v[1]];
    const o = [v[0] - C.x, v[1] - C.y];
    const a = D[0] ** 2 + D[1] ** 2;
    const b = 2 * (o[0] * D[0] + o[1] * D[1]);
    const c = o[0] ** 2 + o[1] ** 2 - R * R;
    const s = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    return [v[0] + s * D[0], v[1] + s * D[1]];
  });
  return V.map((v, k) => ({
    blade: `M${P(v)}L${P(E[k])}A${R} ${R} 0 0 0 ${P(E[(k - 1 + N) % N])}Z`,
    edge: `M${P(v)}L${P(E[k])}`,
  }));
}

function aperture(doc, t) {
  const open = bladeGeometry(44, -90);
  const shut = bladeGeometry(31, -78);
  const shade = doc.uid('bs');
  doc.def(
    `<radialGradient id="${shade}" gradientUnits="userSpaceOnUse" cx="${C.x}" cy="${C.y}" r="92"><stop offset=".38" stop-color="${t.lens.blade[0]}"/><stop offset=".72" stop-color="${t.lens.blade[1]}"/><stop offset="1" stop-color="${t.lens.rim}"/></radialGradient>`,
  );
  const morph = (a, b) =>
    `<animate attributeName="d" dur="10s" repeatCount="indefinite" values="${a};${b};${a}" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
  return el(
    'g',
    {},
    open.map((g, k) =>
      el('path', { d: g.blade, fill: `url(#${shade})`, stroke: '#000', 'stroke-opacity': 0.55, 'stroke-width': 0.8 }, morph(g.blade, shut[k].blade)) +
      el('path', { d: g.edge, stroke: '#fff', 'stroke-opacity': 0.26, 'stroke-width': 1 }, morph(g.edge, shut[k].edge)),
    ),
  );
}

/* ── exposure scale & scanline ─────────────────────────────────────────── */

function exposure(doc, t) {
  const y = 324;
  const step = 8.5;
  let major = '';
  let minor = '';
  const labels = [];
  for (let i = -9; i <= 9; i++) {
    const x = f(C.x + i * step);
    if (i % 3) minor += `M${x} ${y + 2}v4`;
    else {
      major += `M${x} ${y}v7`;
      const v = i / 3;
      labels.push(doc.text(v > 0 ? `+${v}` : String(v), { x: C.x + i * step, y: y + 19, size: 8.5, stack: 'mono', fill: t.ink4, anchor: 'middle' }));
    }
  }
  doc.css('.ev{animation:ev 7s ease-in-out infinite}@keyframes ev{0%,100%{transform:translateX(0)}35%{transform:translateX(-8.5px)}70%{transform:translateX(5px)}}');
  return [
    el('path', { d: minor, stroke: t.ink4 }),
    el('path', { d: major, stroke: t.ink3, 'stroke-width': 1.2 }),
    ...labels,
    el('path', { d: `M${C.x - 3.5} ${y - 6}h7l-3.5 4.5z`, fill: t.signal, class: 'ev' }),
  ].join('');
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

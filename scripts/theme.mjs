// Design system: tokens for both colour schemes plus the shared primitives every
// panel is assembled from (frame, glass tiles, border beam, pills, headers…).

import { el, f, rrect } from './lib/svg.mjs';
import { grainDataUri } from './lib/noise.mjs';
import { UI, FILLED } from './lib/icons.mjs';

export const FACES = {
  display: { family: 'Syncopate', weight: 700 },
  sans: { family: 'Geist', weight: 400 },
  sansMd: { family: 'Geist', weight: 500 },
  sansSb: { family: 'Geist', weight: 600 },
  mono: { family: 'Geist Mono', weight: 400 },
  monoMd: { family: 'Geist Mono', weight: 500 },
  cjkLt: { family: 'Noto Sans SC', weight: 300 },
  cjk: { family: 'Noto Sans SC', weight: 400 },
  cjkMd: { family: 'Noto Sans SC', weight: 500 },
};

// Latin faces first; CJK characters fall through to Noto Sans SC.
export const STACKS = {
  display: ['display', 'cjkMd'],
  sans: ['sans', 'cjk'],
  sansMd: ['sansMd', 'cjkMd'],
  sansSb: ['sansSb', 'cjkMd'],
  mono: ['mono', 'cjk'],
  monoMd: ['monoMd', 'cjkMd'],
  cjkLt: ['cjkLt', 'sans'],
  cjk: ['cjk', 'sans'],
};

export const THEMES = {
  dark: {
    name: 'dark',
    bg: '#05060A',
    bg2: '#0B0D16',
    ink: '#F3F4F8',
    ink2: '#B4B9C7',
    ink3: '#7A8193',
    ink4: '#5C6378',
    line: 'rgba(255,255,255,0.05)',
    line2: 'rgba(255,255,255,0.09)',
    line3: 'rgba(255,255,255,0.16)',
    edgeTop: 'rgba(255,255,255,0.18)',
    edgeBottom: 'rgba(255,255,255,0.05)',
    glass: 'rgba(255,255,255,0.03)',
    glass2: 'rgba(255,255,255,0.065)',
    hi: '#FFFFFF',
    hiO: 0.32,
    violet: '#8B5CF6',
    violet2: '#A78BFA',
    cyan: '#22D3EE',
    blue: '#60A5FA',
    signal: '#4ADE80',
    rec: '#FF453A',
    amber: '#FBBF24',
    rose: '#F472B6',
    chipInk: '#03141A',
    // Data colours: categorical slots validated with the dataviz method
    // (adjacent CVD ΔE ≥ 19, normal-vision ΔE ≥ 24, ≥ 3:1 on the tile surface).
    series: ['#0891B2', '#D97706', '#8B5CF6', '#DB2777'],
    other: '#646B80',
    up: '#4ADE80',
    down: '#F87171',
    surface: '#0E1018',
    tintO: 0.16,
    grain: 0.035,
    shadow: false,
    // Liquid-chrome wordmark: the hard step at 50% is the "horizon" reflection.
    chrome: [[0, '#FFFFFF'], [0.46, '#D9DDE7'], [0.5, '#7F889D'], [0.55, '#AEB5C5'], [1, '#F4F6FA']],
    aurora: { violet: '#6D28D9', cyan: '#0891B2', rose: '#BE185D' },
    lens: { blade: ['#3A3F55', '#171A25'], rim: '#0B0C12', core: ['#E8FBFF', '#22D3EE', '#7C3AED', '#1A0B3D', '#07070C'] },
  },
  light: {
    name: 'light',
    bg: '#F7F8FB',
    bg2: '#EEF0F7',
    ink: '#0A0C12',
    ink2: '#434958',
    ink3: '#646B7A',
    ink4: '#8C93A1',
    line: 'rgba(10,12,18,0.055)',
    line2: 'rgba(10,12,18,0.09)',
    line3: 'rgba(10,12,18,0.16)',
    edgeTop: 'rgba(255,255,255,0.95)',
    edgeBottom: 'rgba(10,12,18,0.08)',
    glass: 'rgba(255,255,255,0.62)',
    glass2: 'rgba(255,255,255,0.9)',
    hi: '#FFFFFF',
    hiO: 0.9,
    violet: '#6D28D9',
    violet2: '#7C3AED',
    cyan: '#0891B2',
    blue: '#2563EB',
    signal: '#16A34A',
    rec: '#E5484D',
    amber: '#D97706',
    rose: '#DB2777',
    chipInk: '#FFFFFF',
    series: ['#0891B2', '#D97706', '#7C3AED', '#DB2777'],
    other: '#878E9C',
    up: '#15803D',
    down: '#B91C1C',
    surface: '#FBFBFD',
    tintO: 0.14,
    grain: 0.045,
    shadow: true,
    chrome: [[0, '#3A3F4E'], [0.46, '#151821'], [0.5, '#5A6276'], [0.55, '#20242F'], [1, '#0A0C12']],
    aurora: { violet: '#C4B5FD', cyan: '#A5F3FC', rose: '#FBCFE8' },
    lens: { blade: ['#40465C', '#1B1E2A'], rim: '#0E1017', core: ['#E8FBFF', '#22D3EE', '#7C3AED', '#1A0B3D', '#07070C'] },
  },
};

const GRAIN = grainDataUri();

// Brand icons resolved at build time: name → { d, vb }.
export const BRANDS = new Map();

/* ── gradients ─────────────────────────────────────────────────────────── */

export function linear(doc, stops, { x1 = 0, y1 = 0, x2 = 1, y2 = 0, units } = {}) {
  return doc.once(`lg:${JSON.stringify([stops, x1, y1, x2, y2, units])}`, () => {
    const id = doc.uid('lg');
    const s = stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }));
    doc.def(el('linearGradient', { id, x1, y1, x2, y2, gradientUnits: units }, s));
    return id;
  });
}

export const brand = (doc, t, dir) => linear(doc, [[0, t.violet2], [1, t.cyan]], dir);

// Soft radial falloff (roughly Gaussian) — the cheap stand-in for blur filters.
export function glowFill(doc, color, opacity) {
  return doc.once(`rg:${color}:${opacity}`, () => {
    const id = doc.uid('rg');
    const s = [[0, 1], [0.2, 0.8], [0.4, 0.48], [0.6, 0.22], [0.8, 0.07], [1, 0]].map(([o, k]) =>
      el('stop', { offset: o, 'stop-color': color, 'stop-opacity': f(k * opacity) }),
    );
    doc.def(el('radialGradient', { id }, s));
    return `url(#${id})`;
  });
}

/* ── panel frame ───────────────────────────────────────────────────────── */

export function frame(doc, t, { r = 22, glows = [], grid = 40, fade = [0.5, 0.45, 0.75] } = {}) {
  const { width: w, height: h } = doc;
  const clip = doc.uid('fc');
  const pat = doc.uid('gp');
  const fadeGrad = doc.uid('fg');
  const mask = doc.uid('fm');
  doc.def(`<clipPath id="${clip}"><path d="${rrect(0, 0, w, h, r)}"/></clipPath>`);
  doc.def(
    `<pattern id="${pat}" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse" x="${f((w % grid) / 2)}" y="${f((h % grid) / 2)}"><path d="M${grid} .5H.5V${grid}" fill="none" stroke="${t.line}"/></pattern>`,
  );
  doc.def(
    `<radialGradient id="${fadeGrad}" cx="${fade[0]}" cy="${fade[1]}" r="${fade[2]}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="${mask}"><rect width="${w}" height="${h}" fill="url(#${fadeGrad})"/></mask>`,
  );
  const grain = doc.once('grain', () => {
    const id = doc.uid('gn');
    doc.def(`<pattern id="${id}" width="64" height="64" patternUnits="userSpaceOnUse"><image href="${GRAIN}" width="64" height="64"/></pattern>`);
    return id;
  });

  const glowEls = glows.map((g) => {
    let cls;
    if (g.drift) {
      cls = doc.uid('dr');
      doc.css(`.${cls}{animation:${cls} ${g.dur ?? 24}s ease-in-out infinite alternate}@keyframes ${cls}{to{transform:translate(${g.drift[0]}px,${g.drift[1]}px)}}`);
    }
    return el('ellipse', { cx: g.cx, cy: g.cy, rx: g.rx, ry: g.ry ?? g.rx, fill: glowFill(doc, g.color, g.o), class: cls });
  });

  const back = el('g', { 'clip-path': `url(#${clip})` }, [
    el('rect', { width: w, height: h, fill: `url(#${linear(doc, [[0, t.bg2], [1, t.bg]], { x2: 0, y2: 1 })})` }),
    ...glowEls,
    el('rect', { width: w, height: h, fill: `url(#${pat})`, mask: `url(#${mask})` }),
    el('rect', { width: w, height: h, fill: `url(#${grain})`, opacity: t.grain }),
  ]);
  const front = [
    el('path', { d: rrect(0.5, 0.5, w - 1, h - 1, r - 0.5), fill: 'none', stroke: `url(#${edgeGrad(doc, t)})` }),
    el('rect', { x: r + 30, y: 0.5, width: w - 2 * r - 60, height: 1, fill: `url(#${specGrad(doc, t)})` }),
  ].join('');
  return { back, front, clip };
}

const edgeGrad = (doc, t) => linear(doc, [[0, t.edgeTop], [1, t.edgeBottom]], { x2: 0, y2: 1 });
const specGrad = (doc, t) => linear(doc, [[0, t.hi, 0], [0.5, t.hi, t.hiO], [1, t.hi, 0]]);

/* ── glass tile ────────────────────────────────────────────────────────── */

export function glass(doc, t, { x, y, w, h, r = 14, tint, tintAt = [0.12, 0], fill = t.glass }) {
  const out = [];
  const shape = rrect(x, y, w, h, r);
  if (t.shadow) {
    const sh = doc.once('shadow', () => {
      const id = doc.uid('sh');
      doc.def(`<filter id="${id}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1B2140" flood-opacity=".07"/></filter>`);
      return id;
    });
    out.push(el('path', { d: shape, fill: '#fff', opacity: 0.5, filter: `url(#${sh})` }));
  }
  out.push(el('path', { d: shape, fill }));
  if (tint) {
    const id = doc.once(`tint:${tint}:${tintAt}`, () => {
      const gid = doc.uid('tg');
      doc.def(
        `<radialGradient id="${gid}" cx="${tintAt[0]}" cy="${tintAt[1]}" r="1"><stop offset="0" stop-color="${tint}" stop-opacity="${t.tintO}"/><stop offset=".55" stop-color="${tint}" stop-opacity="${f(t.tintO / 4)}"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient>`,
      );
      return gid;
    });
    out.push(el('path', { d: shape, fill: `url(#${id})` }));
  }
  out.push(el('path', { d: rrect(x + 0.5, y + 0.5, w - 1, h - 1, r - 0.5), fill: 'none', stroke: `url(#${edgeGrad(doc, t)})` }));
  return out.join('');
}

// A comet of light that travels once around a tile's border, then rests.
export function beam(doc, t, { x, y, w, h, r = 14, dur = 9, delay = 0 }) {
  doc.once('beam', () =>
    doc.css(
      '.bm{stroke-dasharray:70 930;stroke-dashoffset:1000;opacity:0;animation:bm 9s linear infinite}' +
        '@keyframes bm{0%{stroke-dashoffset:1000;opacity:0}3%{opacity:1}31%{opacity:1}34%{stroke-dashoffset:0;opacity:0}to{stroke-dashoffset:0;opacity:0}}',
    ),
  );
  const d = rrect(x + 0.5, y + 0.5, w - 1, h - 1, r);
  const g = `url(#${brand(doc, t, { x2: 1, y2: 1 })})`;
  const style = `animation-duration:${dur}s;animation-delay:${delay}s`;
  return [
    el('path', { d, pathLength: 1000, fill: 'none', stroke: g, 'stroke-width': 5, 'stroke-opacity': 0.22, 'stroke-linecap': 'round', class: 'bm', style }),
    el('path', { d, pathLength: 1000, fill: 'none', stroke: g, 'stroke-width': 1.4, 'stroke-linecap': 'round', class: 'bm', style }),
  ].join('');
}

/* ── small parts ───────────────────────────────────────────────────────── */

export function statusDot(doc, t, { cx, cy, r = 3.5, color = t.signal, dur = 2.2 }) {
  doc.once('pulse', () =>
    doc.css('.pl{transform-box:fill-box;transform-origin:center;animation:pl 2.2s ease-out infinite}@keyframes pl{from{transform:scale(1);opacity:.6}to{transform:scale(3.4);opacity:0}}'),
  );
  return (
    el('circle', { cx, cy, r, fill: color, class: 'pl', style: `animation-duration:${dur}s` }) +
    el('circle', { cx, cy, r, fill: color })
  );
}

export function icon(doc, name, { x, y, size = 16, color, sw = 1.5 }) {
  const id = doc.once(`icon:${name}`, () => {
    const gid = doc.uid('i');
    if (UI[name]) {
      const filled = FILLED.has(name);
      doc.def(el('path', { id: gid, d: UI[name], 'vector-effect': filled ? undefined : 'non-scaling-stroke' }));
      return { gid, vb: 24, filled };
    }
    const b = BRANDS.get(name);
    if (!b) throw new Error(`Icon "${name}" was not loaded`);
    doc.def(el('path', { id: gid, d: b.d }));
    return { gid, vb: b.vb, filled: true };
  });
  const s = size / id.vb;
  const paint = id.filled
    ? { fill: color }
    : { fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  return el('use', { href: `#${id.gid}`, transform: `translate(${f(x)} ${f(y)}) scale(${f(s * 1000) / 1000})`, ...paint });
}

// Text runs laid out in sequence; `grad` parts get a continuous brand gradient
// (merged outline, since <use> glyphs would restart the gradient per glyph).
export function rich(doc, t, parts, { x, y, size, stack, tracking = 0, fill = t.ink }) {
  const out = [];
  let cx = x;
  for (const p of parts) {
    const opts = { size, stack: p.stack ?? stack, tracking };
    const w = doc.ts.measure(p.text, opts);
    if (p.grad) {
      const g = linear(doc, [[0, t.violet2], [1, t.cyan]], { x1: f(cx), y1: 0, x2: f(cx + w), y2: 0, units: 'userSpaceOnUse' });
      out.push(el('path', { d: doc.ts.path(p.text, { x: cx, y, ...opts }).d, fill: `url(#${g})` }));
    } else {
      out.push(doc.text(p.text, { x: cx, y, ...opts, fill: p.fill ?? fill }));
    }
    cx += w + tracking * size;
  }
  return { svg: out.join(''), w: cx - x - tracking * size };
}

export const fmt = (n) => Number(n).toLocaleString('en-US');

// Language colours follow the language, never its rank: slots come from the
// config's fixed list (or today's top four), everything else folds into Other.
export const languageSlots = (config, data) =>
  (config.languages?.length ? config.languages : data.languages.map((l) => l.name)).slice(0, 4);
export const langColor = (t, slots, name) => (slots.includes(name) ? t.series[slots.indexOf(name)] : t.other);

export const ACCENTS = { 'LLM INFERENCE': 'amber', 'GPU INFRA': 'blue', 'MACHINE VISION': 'cyan', 'AGENTIC TOOLING': 'violet2', 'DESKTOP CRAFT': 'rose' };

// Splits text into rich() parts, flagging each emphasised word for the gradient.
export function emphasize(text, words = []) {
  if (!words.length) return [{ text }];
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);
  return text.split(re).filter(Boolean).map((s) => (words.includes(s) ? { text: s, grad: true } : { text: s }));
}

// Baseline that vertically centres a line of text in a box.
export const centerY = (doc, stack, size, top, h) => top + h / 2 + doc.ts.capHeight(stack, size) / 2;

// Glass capsule with an optional status dot or icon followed by text segments.
export function pill(doc, t, { x, y, h = 26, parts, dot, iconName, size = 10, pad = 11, gap = 7, fill = t.glass2, anchor = 'start' }) {
  const segs = parts.map((p) => ({ stack: 'mono', tracking: 0.08, fill: t.ink2, ...p }));
  const widths = segs.map((s) => doc.ts.measure(s.text, { size: s.size ?? size, stack: s.stack, tracking: s.tracking }));
  const lead = dot || iconName ? 12 + gap : 0;
  const w = pad * 2 + lead + widths.reduce((a, b) => a + b, 0) + gap * (segs.length - 1);
  const x0 = anchor === 'end' ? x - w : x;
  const out = [glass(doc, t, { x: x0, y, w, h, r: h / 2, fill })];
  let cx = x0 + pad;
  if (dot) out.push(statusDot(doc, t, { cx: cx + 4, cy: y + h / 2, r: 3, color: dot }));
  if (iconName) out.push(icon(doc, iconName, { x: cx - 1, y: y + h / 2 - 7, size: 14, color: t.ink2 }));
  cx += lead;
  segs.forEach((s, i) => {
    const sz = s.size ?? size;
    out.push(doc.text(s.text, { x: cx, y: centerY(doc, s.stack, sz, y, h), size: sz, stack: s.stack, tracking: s.tracking, fill: s.fill }));
    cx += widths[i] + gap;
  });
  return { svg: out.join(''), w };
}

// "01  TITLE ───────────── meta" header used at the top of every panel.
export function header(doc, t, { x, y, w, index, title, meta, dot }) {
  const out = [];
  out.push(doc.text(index, { x, y, size: 10.5, stack: 'monoMd', fill: t.violet2, tracking: 0.08 }));
  const tx = x + 30;
  out.push(doc.text(title, { x: tx, y, size: 10.5, stack: 'display', fill: t.ink, tracking: 0.24 }));
  const titleEnd = tx + doc.ts.measure(title, { size: 10.5, stack: 'display', tracking: 0.24 });
  let lineEnd = x + w;
  if (meta) {
    out.push(doc.text(meta, { x: x + w, y, size: 10, stack: 'mono', fill: t.ink3, tracking: 0.1, anchor: 'end' }));
    lineEnd -= doc.ts.measure(meta, { size: 10, stack: 'mono', tracking: 0.1 }) + 16;
    if (dot) {
      out.push(statusDot(doc, t, { cx: lineEnd + 4, cy: y - 3.5, r: 3, color: dot }));
      lineEnd -= 16;
    }
  }
  const ly = y - doc.ts.capHeight('display', 10.5) / 2;
  const lg = linear(doc, [[0, t.ink, 0.22], [1, t.ink, 0.02]]);
  out.push(el('rect', { x: titleEnd + 16, y: ly - 0.5, width: Math.max(0, lineEnd - titleEnd - 16), height: 1, fill: `url(#${lg})` }));
  return out.join('');
}

// Camera-viewfinder corner brackets.
export function corners(t, { x, y, w, h, len = 16, color, sw = 1.5, opacity = 1 }) {
  const d = [
    `M${x} ${y + len}V${y}H${x + len}`,
    `M${x + w - len} ${y}H${x + w}V${y + len}`,
    `M${x + w} ${y + h - len}V${y + h}H${x + w - len}`,
    `M${x + len} ${y + h}H${x}V${y + h - len}`,
  ].join('');
  return el('path', { d, fill: 'none', stroke: color ?? t.ink, 'stroke-width': sw, opacity, 'stroke-linecap': 'square' });
}

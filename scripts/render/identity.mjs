// 01 · Identity — the current role as a spec card beside the focus areas,
// presented as a ⌘K command palette.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, glass, header, icon, linear, brand, statusDot, centerY } from '../theme.mjs';

const W = 860;
const H = 334;

export function identity(ts, t, { config }) {
  const r = config.role;
  const doc = new Doc(ts, { width: W, height: H, title: `${config.wordmark} — ${r.title}`, desc: `${r.titleEn} · ${r.org} · ${config.location.city}` });
  const dark = isDark(t);
  const { back, front } = frame(doc, t, {
    glows: [
      { cx: 160, cy: 120, rx: 340, ry: 220, color: t.aurora.cyan, o: dark ? 0.26 : 0.55, drift: [30, 20], dur: 28 },
      { cx: 760, cy: 260, rx: 320, ry: 200, color: t.aurora.violet, o: dark ? 0.3 : 0.6, drift: [-30, -16], dur: 32 },
    ],
  });
  return doc.render(
    [
      back,
      header(doc, t, { x: 24, y: 36, w: W - 48, index: '01', title: 'IDENTITY', meta: 'whoami — agooda.profile' }),
      roleCard(doc, t, config, { x: 20, y: 56, w: 392, h: 258 }),
      palette(doc, t, config, { x: 424, y: 56, w: 416, h: 258 }),
      front,
    ].join('\n'),
  );
}

const isDark = (t) => t.name === 'dark';
const label = (doc, t, text, x, y, opts = {}) => doc.text(text, { x, y, size: 9.5, stack: 'mono', fill: t.ink3, tracking: 0.14, ...opts });
const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

function keycap(doc, t, { x, y, w = 18, h = 18, text, iconName }) {
  const out = [el('rect', { x, y, width: w, height: h, rx: 5, fill: t.glass2, stroke: t.line2 })];
  if (iconName) out.push(icon(doc, iconName, { x: x + w / 2 - 5.5, y: y + h / 2 - 5.5, size: 11, color: t.ink2, sw: 1.3 }));
  if (text) out.push(doc.text(text, { x: x + w / 2, y: centerY(doc, 'mono', 9, y, h), size: 9, stack: 'mono', fill: t.ink2, anchor: 'middle' }));
  return out.join('');
}

function roleCard(doc, t, config, b) {
  const r = config.role;
  const loc = config.location;
  const out = [glass(doc, t, { ...b, r: 18, tint: t.cyan, tintAt: [0.1, 0] })];
  out.push(statusDot(doc, t, { cx: b.x + 21, cy: b.y + 23.5, r: 3 }));
  out.push(label(doc, t, 'CURRENT ROLE', b.x + 32, b.y + 27));
  out.push(label(doc, t, `${loc.city} · ${loc.tz}`, b.x + b.w - 16, b.y + 27, { fill: t.ink4, anchor: 'end' }));
  out.push(doc.text(r.title, { x: b.x + 16, y: b.y + 66, size: 21, stack: 'sansSb', fill: t.ink }));
  out.push(doc.text(r.titleEn, { x: b.x + 16, y: b.y + 90, size: 13, stack: 'sansMd', fill: t.ink2 }));

  let tx = b.x + 16;
  const tag = { size: 9, stack: 'mono', tracking: 0.1 };
  r.tags.forEach((name, i) => {
    const w = doc.ts.measure(name, tag) + (i ? 16 : 26);
    out.push(el('rect', { x: tx, y: b.y + 104, width: f(w), height: 20, rx: 6, fill: t.glass2, stroke: t.line2 }));
    if (!i) out.push(el('circle', { cx: tx + 10, cy: b.y + 114, r: 2.6, fill: t.cyan }));
    out.push(doc.text(name, { x: tx + (i ? 8 : 18), y: centerY(doc, 'mono', 9, b.y + 104, 20), ...tag, fill: t.ink2 }));
    tx += w + 6;
  });

  out.push(el('rect', { x: b.x + 16, y: b.y + 142, width: b.w - 32, height: 1, fill: t.line2 }));
  const rows = [
    ['ORG', r.org],
    ['DOMAIN', r.domain],
    ['BASE', `${loc.cityCn} ${titleCase(loc.city)} · ${loc.tz}`],
  ];
  rows.forEach(([k, v], i) => {
    const y = b.y + 170 + i * 28;
    out.push(label(doc, t, k, b.x + 16, y, { size: 9, fill: t.ink4 }));
    out.push(doc.text(doc.ts.ellipsize(v, { maxWidth: b.w - 104, size: 12.5, stack: 'sans' }), { x: b.x + 88, y: y + 0.5, size: 12.5, stack: 'sans', fill: t.ink }));
  });
  return out.join('');
}

function palette(doc, t, config, b) {
  const out = [glass(doc, t, { ...b, r: 18, tint: t.violet, tintAt: [0.9, 0] })];

  // Search field with a query that types itself, waits, then backspaces.
  const field = { x: b.x + 14, y: b.y + 14, w: b.w - 28, h: 38 };
  out.push(glass(doc, t, { ...field, r: 11, fill: t.glass2 }));
  out.push(icon(doc, 'search', { x: field.x + 12, y: field.y + 11, size: 16, color: t.ink3 }));
  const query = 'agooda --focus';
  const q = { size: 13, stack: 'mono' };
  const qx = field.x + 38;
  const qy = centerY(doc, 'mono', 13, field.y, field.h);
  const qw = f(doc.ts.measure(query, q));
  doc.css(
    `.ty{animation:ty 10s steps(${[...query].length},end) infinite}@keyframes ty{0%{transform:translateX(-${qw}px)}14%,92%{transform:translateX(0)}to{transform:translateX(-${qw}px)}}` +
      '.blink{animation:blink 1.05s steps(1) infinite}@keyframes blink{50%{opacity:0}}',
  );
  const clip = doc.uid('qc');
  doc.def(`<clipPath id="${clip}"><rect class="ty" x="${qx - 2}" y="${field.y}" width="${qw + 4}" height="${field.h}"/></clipPath>`);
  out.push(el('g', { 'clip-path': `url(#${clip})` }, doc.text(query, { x: qx, y: qy, ...q, fill: t.ink })));
  out.push(el('g', { class: 'ty' }, el('rect', { x: qx + qw + 2, y: field.y + 11, width: 1.6, height: 16, fill: t.cyan, class: 'blink' })));
  const capX = field.x + field.w - 52;
  out.push(keycap(doc, t, { x: capX, y: field.y + 10, iconName: 'command' }));
  out.push(keycap(doc, t, { x: capX + 22, y: field.y + 10, text: 'K' }));

  // Results list; the selection steps through the rows like someone pressing ↓.
  const listY = b.y + 84;
  const pitch = 34;
  out.push(label(doc, t, 'FOCUS AREAS', b.x + 18, b.y + 74));
  out.push(label(doc, t, `${config.focus.length} RESULTS`, b.x + b.w - 18, b.y + 74, { fill: t.ink4, anchor: 'end' }));
  const kf = config.focus.map((_, i) => `${i * 25}%,${i * 25 + 20}%{transform:translateY(${i * pitch}px)}`).join('');
  doc.css(`.sel{animation:sel 10s cubic-bezier(.65,0,.35,1) infinite}@keyframes sel{${kf}to{transform:translateY(0)}}`);
  const selFill = linear(doc, [[0, t.violet, isDark(t) ? 0.22 : 0.14], [1, t.cyan, isDark(t) ? 0.06 : 0.05]]);
  out.push(
    el('g', { class: 'sel' }, [
      el('rect', { x: b.x + 8, y: listY, width: b.w - 16, height: pitch - 2, rx: 9, fill: `url(#${selFill})`, stroke: t.line2 }),
      el('rect', { x: b.x + 8, y: listY + 9, width: 2.5, height: pitch - 20, rx: 1.25, fill: `url(#${brand(doc, t, { x2: 0, y2: 1 })})` }),
      keycap(doc, t, { x: b.x + b.w - 40, y: listY + 7, iconName: 'enter' }),
    ]),
  );
  config.focus.forEach((item, i) => {
    const y = listY + i * pitch;
    out.push(el('rect', { x: b.x + 18, y: y + 4, width: 24, height: 24, rx: 7, fill: t.glass2, stroke: t.line2 }));
    out.push(icon(doc, item.icon, { x: b.x + 23, y: y + 9, size: 14, color: t.ink2, sw: 1.4 }));
    const ty = centerY(doc, 'sansMd', 13.5, y, pitch - 2);
    out.push(doc.text(item.title, { x: b.x + 54, y: ty, size: 13.5, stack: 'sansMd', fill: t.ink }));
    const dx = b.x + 66 + doc.ts.measure(item.title, { size: 13.5, stack: 'sansMd' });
    const detail = doc.ts.ellipsize(item.detail, { maxWidth: b.x + b.w - 84 - dx, size: 12, stack: 'sans' });
    out.push(doc.text(detail, { x: dx, y: ty, size: 12, stack: 'sans', fill: t.ink3 }));
    out.push(icon(doc, 'command', { x: b.x + b.w - 74, y: ty - 8.5, size: 10, color: t.ink4, sw: 1.2 }));
    out.push(doc.text(String(i + 1), { x: b.x + b.w - 62, y: ty, size: 10, stack: 'mono', fill: t.ink4 }));
  });

  // Keyboard legend.
  const fy = b.y + b.h - 30;
  out.push(el('rect', { x: b.x + 1, y: fy, width: b.w - 2, height: 1, fill: t.line2 }));
  let lx = b.x + 16;
  for (const [caps, text] of [[['up', 'down'], 'navigate'], [['enter'], 'open'], [['esc'], 'dismiss']]) {
    for (const c of caps) {
      out.push(c === 'esc' ? keycap(doc, t, { x: lx, y: fy + 6, w: 28, text: 'esc' }) : keycap(doc, t, { x: lx, y: fy + 6, iconName: c }));
      lx += (c === 'esc' ? 28 : 18) + 4;
    }
    out.push(doc.text(text, { x: lx + 2, y: centerY(doc, 'sans', 11, fy + 6, 18), size: 11, stack: 'sans', fill: t.ink3 }));
    lx += doc.ts.measure(text, { size: 11, stack: 'sans' }) + 18;
  }
  out.push(label(doc, t, `${config.handle.slice(1)}/profile`, b.x + b.w - 16, centerY(doc, 'mono', 9.5, fy + 6, 18), { fill: t.ink4, anchor: 'end', tracking: 0.08 }));
  return out.join('');
}

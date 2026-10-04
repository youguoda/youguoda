// 01 · Identity — a bento of four tiles: a ⌘K command palette listing focus
// areas, the repo currently being built, the workstation, and a philosophy line.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, glass, header, icon, linear, brand, statusDot, rich, emphasize, centerY } from '../theme.mjs';

const W = 860;
const H = 422;

export function identity(ts, t, { config, data }) {
  const doc = new Doc(ts, { width: W, height: H, title: `${config.wordmark} — identity`, desc: config.focus.map((x) => x.title).join(', ') });
  const dark = isDark(t);
  const { back, front } = frame(doc, t, {
    glows: [
      { cx: 160, cy: 120, rx: 340, ry: 220, color: t.aurora.violet, o: dark ? 0.32 : 0.6, drift: [30, 20], dur: 28 },
      { cx: 760, cy: 300, rx: 300, ry: 220, color: t.aurora.cyan, o: dark ? 0.24 : 0.6, drift: [-30, -16], dur: 32 },
    ],
  });
  return doc.render(
    [
      back,
      header(doc, t, { x: 24, y: 36, w: W - 48, index: '01', title: 'IDENTITY', meta: 'whoami — agooda.profile' }),
      palette(doc, t, config, { x: 20, y: 56, w: 500, h: 258 }),
      nowBuilding(doc, t, config, data, { x: 532, y: 56, w: 308, h: 123 }),
      rig(doc, t, config, { x: 532, y: 191, w: 308, h: 123 }),
      philosophy(doc, t, config, { x: 20, y: 326, w: 820, h: 76 }),
      front,
    ].join('\n'),
  );
}

const isDark = (t) => t.name === 'dark';
const label = (doc, t, text, x, y, opts = {}) => doc.text(text, { x, y, size: 9.5, stack: 'mono', fill: t.ink3, tracking: 0.14, ...opts });

function keycap(doc, t, { x, y, w = 18, h = 18, text, iconName }) {
  const out = [el('rect', { x, y, width: w, height: h, rx: 5, fill: t.glass2, stroke: t.line2 })];
  if (iconName) out.push(icon(doc, iconName, { x: x + w / 2 - 5.5, y: y + h / 2 - 5.5, size: 11, color: t.ink2, sw: 1.3 }));
  if (text) out.push(doc.text(text, { x: x + w / 2, y: centerY(doc, 'mono', 9, y, h), size: 9, stack: 'mono', fill: t.ink2, anchor: 'middle' }));
  return out.join('');
}

function palette(doc, t, config, b) {
  const out = [glass(doc, t, { ...b, r: 18, tint: t.violet, tintAt: [0.1, 0] })];

  // Search field with a query that types itself, waits, then backspaces.
  const field = { x: b.x + 14, y: b.y + 14, w: b.w - 28, h: 38 };
  out.push(glass(doc, t, { ...field, r: 11, fill: t.glass2 }));
  out.push(icon(doc, 'search', { x: field.x + 12, y: field.y + 11, size: 16, color: t.ink3 }));
  const query = 'agooda --focus';
  const q = { size: 13, stack: 'mono' };
  const qx = field.x + 38;
  const qy = centerY(doc, 'mono', 13, field.y, field.h);
  const qw = f(doc.ts.measure(query, q));
  const n = [...query].length;
  doc.css(
    `.ty{animation:ty 10s steps(${n},end) infinite}@keyframes ty{0%{transform:translateX(-${qw}px)}14%,92%{transform:translateX(0)}to{transform:translateX(-${qw}px)}}` +
      '.blink{animation:blink 1.05s steps(1) infinite}@keyframes blink{50%{opacity:0}}',
  );
  const clip = doc.uid('qc');
  doc.def(`<clipPath id="${clip}"><rect class="ty" x="${qx - 2}" y="${field.y}" width="${qw + 4}" height="${field.h}"/></clipPath>`);
  out.push(el('g', { 'clip-path': `url(#${clip})` }, doc.text(query, { x: qx, y: qy, ...q, fill: t.ink })));
  out.push(el('g', { class: 'ty' }, el('rect', { x: qx + qw + 2, y: field.y + 11, width: 1.6, height: 16, fill: t.cyan, class: 'blink' })));
  const capX = field.x + field.w - 12 - 40;
  out.push(keycap(doc, t, { x: capX, y: field.y + 10, iconName: 'command' }));
  out.push(keycap(doc, t, { x: capX + 22, y: field.y + 10, text: 'K' }));

  // Results list.
  const listY = b.y + 84;
  const pitch = 34;
  out.push(label(doc, t, 'FOCUS AREAS', b.x + 18, b.y + 74));
  out.push(label(doc, t, `${config.focus.length} RESULTS`, b.x + b.w - 18, b.y + 74, { fill: t.ink4, anchor: 'end' }));

  // Selection highlight steps through the rows like someone pressing ↓.
  const steps = config.focus.map((_, i) => i * pitch);
  const kf = steps.map((y, i) => `${i * 25}%,${i * 25 + 20}%{transform:translateY(${y}px)}`).join('');
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
    const tw = doc.ts.measure(item.title, { size: 13.5, stack: 'sansMd' });
    out.push(doc.text(item.detail, { x: b.x + 66 + tw, y: ty, size: 12, stack: 'sans', fill: t.ink3 }));
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

function nowBuilding(doc, t, config, data, b) {
  const repo = data.repos.find((r) => !r.archived) ?? data.repos[0];
  const out = [glass(doc, t, { ...b, r: 18, tint: t.signal, tintAt: [0.9, 0] })];
  if (!repo) return out.join('');
  const meta = config.projects.find((p) => p.repo === repo.name);
  out.push(statusDot(doc, t, { cx: b.x + 21, cy: b.y + 23.5, r: 3 }));
  out.push(label(doc, t, 'NOW BUILDING', b.x + 32, b.y + 27));
  out.push(label(doc, t, repo.pushedAt.slice(0, 10), b.x + b.w - 16, b.y + 27, { fill: t.ink4, anchor: 'end', tracking: 0.08 }));
  out.push(doc.text(meta?.title ?? repo.name, { x: b.x + 16, y: b.y + 56, size: 17, stack: 'sansSb', fill: t.ink }));
  const desc = meta?.desc ?? repo.description ?? `${repo.language ?? 'Code'} · ${data.login}/${repo.name}`;
  doc.ts.wrap(desc, { maxWidth: b.w - 32, maxLines: 2, size: 11.5, stack: 'sans' }).forEach((line, i) => {
    out.push(doc.text(line, { x: b.x + 16, y: b.y + 78 + i * 17, size: 11.5, stack: 'sans', fill: t.ink3 }));
  });
  return out.join('');
}

function rig(doc, t, config, b) {
  const out = [glass(doc, t, { ...b, r: 18 })];
  out.push(label(doc, t, 'RIG', b.x + 16, b.y + 27));
  out.push(label(doc, t, 'WORKSTATION', b.x + b.w - 16, b.y + 27, { fill: t.ink4, anchor: 'end' }));
  config.rig.forEach((r, i) => {
    const y = b.y + 42 + i * 25;
    out.push(icon(doc, r.icon, { x: b.x + 16, y: y + 2, size: 14, color: t.ink3, sw: 1.4 }));
    out.push(label(doc, t, r.key, b.x + 40, y + 13, { size: 9, fill: t.ink4 }));
    out.push(doc.text(r.value, { x: b.x + 104, y: y + 13.5, size: 12.5, stack: 'sansMd', fill: t.ink }));
  });
  return out.join('');
}

function philosophy(doc, t, config, b) {
  const p = config.philosophy;
  const out = [glass(doc, t, { ...b, r: 18, tint: t.violet, tintAt: [0, 0.5] })];
  out.push(el('path', { d: doc.ts.path('“', { x: b.x + 18, y: b.y + 66, size: 60, stack: 'sansSb' }).d, fill: `url(#${brand(doc, t, { x2: 1, y2: 1 })})`, opacity: 0.9 }));
  out.push(rich(doc, t, emphasize(p.quote, p.emphasis), { x: b.x + 62, y: b.y + 36, size: 18, stack: 'cjk', tracking: 0.06 }).svg);
  out.push(doc.text(p.en, { x: b.x + 62, y: b.y + 58, size: 12, stack: 'sans', fill: t.ink3 }));
  out.push(label(doc, t, 'PHILOSOPHY', b.x + b.w - 20, b.y + 32, { fill: t.ink4, anchor: 'end' }));
  out.push(label(doc, t, `— ${p.source}`, b.x + b.w - 20, b.y + 56, { anchor: 'end', tracking: 0.06 }));
  return out.join('');
}

// 02 · Core stack — tools grouped by layer, top (intelligence) to bottom
// (platform). Monochrome marks sit on glass with an ambient brand-colour glow;
// a pulse runs down the layer rail and each row lights up as it passes.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, glass, header, icon, glowFill, linear, centerY, fmt } from '../theme.mjs';

const W = 860;
const ROW = 44;
const TOP = 60;
const CYCLE = 5; // seconds for the pulse to travel the rail

export function stack(ts, t, { config, data }) {
  const layers = config.stack;
  const H = TOP + layers.length * ROW + 18;
  const doc = new Doc(ts, { width: W, height: H, title: `${config.wordmark} — core stack`, desc: layers.map((l) => `${l.layer}: ${l.items.map((i) => i[1]).join(', ')}`).join('; ') });
  const dark = t.name === 'dark';
  const { back, front } = frame(doc, t, {
    glows: [
      { cx: 120, cy: H / 2, rx: 260, ry: 200, color: t.aurora.cyan, o: dark ? 0.2 : 0.5, drift: [24, -12], dur: 27 },
      { cx: 720, cy: 40, rx: 320, ry: 180, color: t.aurora.violet, o: dark ? 0.26 : 0.55, drift: [-30, 14], dur: 31 },
    ],
    fade: [0.5, 0.5, 0.8],
  });

  const out = [back];
  out.push(
    header(doc, t, {
      x: 24, y: 36, w: W - 48, index: '02', title: 'CORE STACK',
      meta: `${data.languages.length} LANGUAGES · ${fmt(data.repoCount)} REPOSITORIES`,
    }),
  );

  // Layer rail with a travelling pulse.
  const railX = 158;
  const y0 = TOP + ROW / 2 - 4;
  const y1 = TOP + (layers.length - 1) * ROW + ROW / 2 - 4;
  out.push(el('rect', { x: railX - 0.5, y: y0, width: 1, height: y1 - y0, fill: t.line3 }));
  const run = f(y1 - y0);
  doc.css(
    `.rail{animation:rail ${CYCLE}s cubic-bezier(.45,0,.55,1) infinite}@keyframes rail{0%{transform:translateY(0);opacity:0}8%{opacity:1}82%{opacity:1}90%,to{transform:translateY(${run}px);opacity:0}}` +
      `.lit{opacity:.55;animation:lit ${CYCLE}s ease-in-out infinite}@keyframes lit{0%,100%{opacity:.55}6%{opacity:1}22%{opacity:.55}}`,
  );
  const grad = linear(doc, [[0, t.cyan, 0], [1, t.cyan, 1]], { x2: 0, y2: 1 });
  out.push(
    el('g', { class: 'rail' }, [
      el('rect', { x: railX - 0.75, y: y0 - 26, width: 1.5, height: 26, fill: `url(#${grad})` }),
      el('circle', { cx: railX, cy: y0, r: 7, fill: glowFill(doc, t.cyan, 0.7) }),
      el('circle', { cx: railX, cy: y0, r: 2.2, fill: t.cyan }),
    ]),
  );

  const left = 176;
  const gap = 10;
  const cols = Math.max(...layers.map((l) => l.items.length));
  const cellW = (W - 24 - left - gap * (cols - 1)) / cols;
  layers.forEach((layer, r) => {
    const y = TOP + r * ROW;
    const cy = y + ROW / 2 - 4;
    const delay = f(((cy - y0) / (y1 - y0 || 1)) * CYCLE * 0.82);
    out.push(doc.text(`L${r + 1}`, { x: 24, y: cy + 3.5, size: 9.5, stack: 'mono', fill: t.ink4, tracking: 0.1 }));
    out.push(doc.text(layer.layer, { x: 50, y: cy + 3.5, size: 10, stack: 'monoMd', fill: t.ink2, tracking: 0.16 }));
    out.push(el('circle', { cx: railX, cy, r: 3, fill: t.bg, stroke: t.ink3 }));

    layer.items.forEach(([ref, name, color], c) => {
      const x = left + c * (cellW + gap);
      const h = ROW - 8;
      out.push(glass(doc, t, { x, y, w: cellW, h, r: 11, fill: t.glass2 }));
      const ix = x + 12;
      const iy = y + h / 2 - 8;
      out.push(el('circle', { cx: ix + 8, cy: iy + 8, r: 17, fill: glowFill(doc, color, dark ? 0.55 : 0.4), class: 'lit', style: `animation-delay:${delay}s` }));
      const name_ = ref.startsWith('ui:') ? ref.slice(3) : ref;
      out.push(icon(doc, name_, { x: ix, y: iy, size: 16, color: t.ink, sw: 1.5 }));
      const label = doc.ts.ellipsize(name, { maxWidth: cellW - 46, size: 12.5, stack: 'sansMd' });
      out.push(doc.text(label, { x: ix + 26, y: centerY(doc, 'sansMd', 12.5, y, h), size: 12.5, stack: 'sansMd', fill: t.ink }));
    });
  });

  out.push(front);
  return doc.render(out.join('\n'));
}

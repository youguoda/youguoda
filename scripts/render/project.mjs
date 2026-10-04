// 03 · Selected work — one clickable card per featured repository, each with a
// small animated illustration of what the project actually does.

import { Doc, el, f, rrect } from '../lib/svg.mjs';
import { frame, glass, beam, icon, corners, glowFill, linear, brand, rich, header, centerY, langColor, languageSlots, ACCENTS } from '../theme.mjs';

const W = 420;
const H = 232;
const PAD = 22;
const ART = { x: 262, y: 54, w: 136, h: 130 };

export function project(ts, t, { config, data, project: p, index }) {
  const repo = data.repos.find((r) => r.name === p.repo);
  const accent = t[p.accent ?? ACCENTS[p.kind] ?? 'violet2'];
  const doc = new Doc(ts, { width: W, height: H, title: `${p.title} — ${p.kind}`, desc: p.desc });
  const dark = t.name === 'dark';
  const { back, front } = frame(doc, t, {
    r: 18,
    grid: 24,
    glows: [
      { cx: 360, cy: 40, rx: 220, ry: 170, color: accent, o: dark ? 0.26 : 0.32, drift: [-14, 10], dur: 21 + index },
      { cx: 30, cy: 250, rx: 220, ry: 140, color: t.aurora.violet, o: dark ? 0.22 : 0.5 },
    ],
    fade: [0.75, 0.35, 0.6],
  });

  const out = [back];
  // Index, category chip and the "open" affordance.
  out.push(doc.text(String(index + 1).padStart(2, '0'), { x: PAD, y: 36, size: 10, stack: 'monoMd', fill: t.violet2, tracking: 0.08 }));
  const kind = { size: 8.5, stack: 'monoMd', tracking: 0.16 };
  const kw = doc.ts.measure(p.kind, kind) + 30;
  out.push(glass(doc, t, { x: 46, y: 23, w: kw, h: 19, r: 9.5, fill: t.glass2 }));
  out.push(el('circle', { cx: 57, cy: 32.5, r: 2.6, fill: accent }));
  out.push(doc.text(p.kind, { x: 65, y: centerY(doc, 'monoMd', 8.5, 23, 19), ...kind, fill: t.ink2 }));
  out.push(el('circle', { cx: W - PAD - 13, cy: 32.5, r: 13, fill: t.glass2, stroke: t.line2 }));
  out.push(icon(doc, 'arrowUpRight', { x: W - PAD - 19, y: 26.5, size: 12, color: t.ink2, sw: 1.5 }));

  // Copy.
  out.push(doc.text(p.title, { x: PAD, y: 80, size: 21, stack: 'sansSb', fill: t.ink }));
  const lines = doc.ts.wrap(p.desc, { maxWidth: ART.x - PAD - 18, maxLines: 3, size: 12, stack: 'sans' });
  lines.forEach((line, i) => out.push(doc.text(line, { x: PAD, y: 104 + i * 18, size: 12, stack: 'sans', fill: t.ink3 })));

  // Tags (drop whatever doesn't fit rather than overflow).
  let tx = PAD;
  const tag = { size: 9, stack: 'mono', tracking: 0.04 };
  for (const name of p.tags ?? []) {
    const w = doc.ts.measure(name, tag) + 16;
    if (tx + w > ART.x - 12) break;
    out.push(el('rect', { x: tx, y: 164, width: f(w), height: 19, rx: 6, fill: t.glass2, stroke: t.line2 }));
    out.push(doc.text(name, { x: tx + 8, y: centerY(doc, 'mono', 9, 164, 19), ...tag, fill: t.ink2 }));
    tx += w + 6;
  }

  // Live repository facts.
  out.push(el('rect', { x: PAD, y: 196, width: W - PAD * 2, height: 1, fill: t.line2 }));
  const fy = 215;
  const meta = { size: 9.5, stack: 'mono', tracking: 0.06 };
  let mx = PAD;
  if (repo?.language) {
    out.push(el('circle', { cx: mx + 4, cy: fy - 3.5, r: 4, fill: langColor(t, languageSlots(config, data), repo.language) }));
    out.push(doc.text(repo.language, { x: mx + 13, y: fy, ...meta, fill: t.ink2 }));
    mx += 13 + doc.ts.measure(repo.language, meta) + 16;
  }
  for (const [name, value] of [['star', repo?.stars], ['fork', repo?.forks]]) {
    if (value === undefined) continue;
    out.push(icon(doc, name, { x: mx, y: fy - 10, size: 12, color: t.ink3, sw: 1.4 }));
    out.push(doc.text(String(value), { x: mx + 16, y: fy, ...meta, fill: t.ink2 }));
    mx += 16 + doc.ts.measure(String(value), meta) + 14;
  }
  if (repo) out.push(doc.text(`UPDATED ${repo.pushedAt.slice(0, 10)}`, { x: W - PAD, y: fy, ...meta, fill: t.ink3, anchor: 'end' }));

  out.push(MOTIFS[p.motif]?.(doc, t, accent, ART) ?? '');
  out.push(beam(doc, t, { x: 0, y: 0, w: W, h: H, r: 18, dur: 9, delay: index * 1.5 }));
  out.push(front);
  return doc.render(out.join('\n'));
}

// Frameless "03 SELECTED WORK" rule that sits above the card grid.
export function workHeader(ts, t, { config }) {
  const doc = new Doc(ts, { width: 860, height: 44, title: 'Selected work', desc: config.projects.map((p) => p.title).join(', ') });
  return doc.render(header(doc, t, { x: 4, y: 28, w: 852, index: '03', title: 'SELECTED WORK', meta: `${config.projects.length} BUILDS · CLICK A CARD TO OPEN` }));
}

/* ── motifs ────────────────────────────────────────────────────────────── */

const mono = (size, fill, extra = {}) => ({ size, stack: 'mono', fill, tracking: 0.12, ...extra });

const MOTIFS = {
  // 拾语: clipboard history stack whose newest entry is being translated.
  clipboard(doc, t, a, B) {
    doc.css('.fl{animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-3px)}}');
    const out = [];
    [
      { x: B.x + 22, y: B.y + 4, w: B.w - 44, h: 50, o: 0.4 },
      { x: B.x + 11, y: B.y + 20, w: B.w - 22, h: 52, o: 0.7 },
    ].forEach((c, i) => {
      out.push(
        el('g', { class: 'fl', opacity: c.o, style: `animation-delay:${-2 - i}s` }, [
          glass(doc, t, { ...c, r: 10, fill: t.glass2 }),
          el('rect', { x: c.x + 10, y: c.y + 12, width: c.w * 0.45, height: 4, rx: 2, fill: t.line3 }),
        ]),
      );
    });
    const c = { x: B.x, y: B.y + 40, w: B.w, h: 78 };
    out.push(
      el('g', { class: 'fl' }, [
        glass(doc, t, { ...c, r: 12, fill: t.glass2, tint: a }),
        doc.text('TEXT', { x: c.x + 11, y: c.y + 17, ...mono(7.5, a, { stack: 'monoMd' }) }),
        doc.text('CTRL+C · 12:04', { x: c.x + c.w - 11, y: c.y + 17, ...mono(7, t.ink3, { anchor: 'end', tracking: 0.06 }) }),
        doc.text('Less, but better.', { x: c.x + 11, y: c.y + 38, size: 11, stack: 'sans', fill: t.ink2 }),
        el('rect', { x: c.x + 11, y: c.y + 47, width: c.w - 22, height: 1, fill: t.line2 }),
        rich(doc, t, [{ text: '少，但更好。', grad: true }], { x: c.x + 11, y: c.y + 65, size: 11, stack: 'cjk' }).svg,
        el('rect', { x: c.x + c.w - 30, y: c.y + 53, width: 19, height: 16, rx: 5, fill: a, opacity: 0.18 }),
        doc.text('译', { x: c.x + c.w - 20.5, y: c.y + 65, size: 9.5, stack: 'cjk', fill: a, anchor: 'middle' }),
      ]),
    );
    return out.join('');
  },

  // SkillsHub: Windows ⇄ WSL2 skill mirroring, verified by content hash.
  sync(doc, t, a, B) {
    const out = [];
    const node = (x, label, ic) => {
      const n = { x, y: B.y + 22, w: 44, h: 50 };
      out.push(glass(doc, t, { ...n, r: 12, fill: t.glass2 }));
      out.push(icon(doc, ic, { x: n.x + 14, y: n.y + 10, size: 16, color: t.ink, sw: 1.4 }));
      out.push(doc.text(label, { x: n.x + n.w / 2, y: n.y + 42, ...mono(7.5, t.ink3, { anchor: 'middle' }) }));
      return n;
    };
    const L = node(B.x, 'WIN', 'windows');
    const R = node(B.x + B.w - 44, 'WSL', 'si:linux');
    const mid = B.x + B.w / 2;
    const top = `M${L.x + L.w} ${L.y + 14}Q${mid} ${L.y - 12} ${R.x} ${R.y + 14}`;
    const bot = `M${R.x} ${R.y + L.h - 14}Q${mid} ${L.y + L.h + 12} ${L.x + L.w} ${L.y + L.h - 14}`;
    for (const d of [top, bot]) out.push(el('path', { d, fill: 'none', stroke: t.line3, 'stroke-dasharray': '2 3' }));
    out.push(el('circle', { r: 2.6, fill: t.cyan }, `<animateMotion dur="2.6s" repeatCount="indefinite" path="${top}"/>`));
    out.push(el('circle', { r: 2.6, fill: a }, `<animateMotion dur="2.6s" begin="-1.3s" repeatCount="indefinite" path="${bot}"/>`));
    const chip = { x: mid - 25, y: L.y + L.h / 2 - 8, w: 50, h: 16 };
    out.push(el('rect', { x: chip.x, y: chip.y, width: chip.w, height: chip.h, rx: 8, fill: t.bg, stroke: t.line3 }));
    out.push(icon(doc, 'check', { x: chip.x + 5, y: chip.y + 3, size: 10, color: t.up, sw: 1.6 }));
    out.push(doc.text('SHA-256', { x: chip.x + 17, y: chip.y + 11, ...mono(6.5, t.ink2, { tracking: 0.04 }) }));
    // Three skill lifecycles.
    let x = B.x + 2;
    const tier = { size: 8.5, stack: 'cjk', fill: t.ink3 };
    for (const [label, c] of [['内置', t.ink3], ['下载', t.cyan], ['自编', a]]) {
      out.push(el('circle', { cx: x + 3, cy: B.y + 104, r: 3, fill: c }));
      out.push(doc.text(label, { x: x + 10, y: B.y + 107.5, ...tier }));
      x += 24 + doc.ts.measure(label, tier);
    }
    return out.join('');
  },

  // SonyPro: tethered viewfinder → agent skill → finished photo.
  shutter(doc, t, a, B) {
    doc.css('.af{animation:af 2.4s steps(1) infinite}@keyframes af{50%{opacity:.25}}');
    const out = [];
    const F = { x: B.x, y: B.y + 2, w: B.w, h: 84 };
    out.push(el('rect', { x: F.x, y: F.y, width: F.w, height: F.h, rx: 9, fill: t.lens.rim, stroke: t.line2 }));
    const thirds = [1, 2].map((k) => `M${f(F.x + (F.w * k) / 3)} ${F.y + 6}V${F.y + F.h - 6}M${F.x + 6} ${f(F.y + (F.h * k) / 3)}H${F.x + F.w - 6}`).join('');
    out.push(el('path', { d: thirds, stroke: '#fff', 'stroke-opacity': 0.08 }));
    out.push(corners(t, { x: F.x + 7, y: F.y + 7, w: F.w - 14, h: F.h - 14, len: 8, color: '#fff', sw: 1.1, opacity: 0.5 }));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        const on = r === 1 && c === 3;
        out.push(el('rect', {
          x: f(F.x + F.w / 2 - 45 + c * 14 - 3), y: f(F.y + F.h / 2 - 14 + r * 14 - 3), width: 6, height: 6, rx: 1,
          fill: 'none', stroke: on ? '#4ADE80' : '#fff', 'stroke-opacity': on ? 1 : 0.18, 'stroke-width': on ? 1.4 : 1, class: on ? 'af' : undefined,
        }));
      }
    }
    out.push(doc.text('ILCE-6700', { x: F.x + 11, y: F.y + 17, ...mono(6.5, '#fff', { opacity: 0.6 }) }));
    out.push(doc.text('RAW+JPEG', { x: F.x + F.w - 11, y: F.y + 17, ...mono(6.5, '#fff', { opacity: 0.45, anchor: 'end' }) }));
    out.push(doc.text('ISO 100  1/250  F2.8', { x: F.x + 11, y: F.y + F.h - 9, ...mono(6.5, '#fff', { opacity: 0.6, tracking: 0.06 }) }));
    // Pipeline.
    const py = B.y + 98;
    const steps = [['camera', 'SHOOT'], ['sparkle', 'SKILL'], ['image', 'OUTPUT']];
    const sx = (i) => B.x + 6 + i * 50;
    out.push(el('path', { d: `M${sx(0) + 22} ${py + 11}H${sx(2)}`, stroke: t.line3, 'stroke-dasharray': '2 3' }));
    out.push(el('circle', { r: 2.4, fill: a }, `<animateMotion dur="3s" repeatCount="indefinite" path="M${sx(0) + 22} ${py + 11}H${sx(2)}"/>`));
    steps.forEach(([ic, label], i) => {
      out.push(el('rect', { x: sx(i), y: py, width: 22, height: 22, rx: 7, fill: t.bg, stroke: i === 1 ? a : t.line3 }));
      out.push(icon(doc, ic, { x: sx(i) + 5, y: py + 5, size: 12, color: i === 1 ? a : t.ink2, sw: 1.4 }));
      out.push(doc.text(label, { x: sx(i) + 11, y: py + 33, ...mono(6, t.ink3, { anchor: 'middle' }) }));
    });
    return out.join('');
  },

  // AllCamera: four camera feeds behind one interface, fired by a soft trigger.
  multicam(doc, t, a, B) {
    doc.css('.tf{opacity:0;animation:tf 4s ease-out infinite}@keyframes tf{0%{opacity:.5}14%,to{opacity:0}}');
    const out = [];
    const scan = doc.once('scanlines', () => {
      const id = doc.uid('sl');
      doc.def(`<pattern id="${id}" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#fff" fill-opacity=".05"/></pattern>`);
      return id;
    });
    const tw = 64;
    const th = 46;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([c, r], i) => {
      const x = B.x + c * (tw + 8);
      const y = B.y + 2 + r * (th + 8);
      const blob = [[0.3, 0.6], [0.7, 0.4], [0.55, 0.7], [0.4, 0.35]][i];
      out.push(el('rect', { x, y, width: tw, height: th, rx: 7, fill: t.lens.rim, stroke: t.line2 }));
      out.push(el('ellipse', { cx: f(x + tw * blob[0]), cy: f(y + th * blob[1]), rx: 26, ry: 18, fill: glowFill(doc, i % 2 ? t.cyan : a, 0.45) }));
      out.push(el('rect', { x, y, width: tw, height: th, rx: 7, fill: `url(#${scan})` }));
      out.push(doc.text(`CAM 0${i + 1}`, { x: x + 6, y: y + 11, ...mono(6, '#fff', { opacity: 0.65 }) }));
      out.push(el('circle', { cx: x + tw - 8, cy: y + 8.5, r: 2, fill: '#FF453A' }));
      if (i === 1) {
        out.push(corners(t, { x: x + 20, y: y + 14, w: 28, h: 22, len: 5, color: '#22D3EE', sw: 1.2 }));
        out.push(doc.text('part .97', { x: x + 20, y: y + 42, ...mono(5.5, '#22D3EE', { tracking: 0.02 }) }));
      }
      out.push(el('rect', { x, y, width: tw, height: th, rx: 7, fill: '#fff', class: 'tf', style: `animation-delay:${i}s` }));
    });
    out.push(icon(doc, 'bolt', { x: B.x + 1, y: B.y + 109, size: 11, color: a, sw: 1.4 }));
    out.push(doc.text('SOFT / HARD TRIGGER', { x: B.x + 16, y: B.y + 118, ...mono(7, t.ink3, { tracking: 0.08 }) }));
    return out.join('');
  },

  // QtDrawRegion: editable rotated-rect, circle and polygon ROIs with handles.
  roi(doc, t, a, B) {
    doc.css('.rr{transform-box:fill-box;transform-origin:center;animation:rr 8s ease-in-out infinite alternate}@keyframes rr{from{transform:rotate(-5deg)}to{transform:rotate(6deg)}}');
    const out = [];
    const C = { x: B.x, y: B.y + 2, w: B.w, h: 100 };
    const grid = doc.uid('pg');
    doc.def(`<pattern id="${grid}" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 .5H.5V8" fill="none" stroke="${t.line}"/></pattern>`);
    out.push(el('rect', { x: C.x, y: C.y, width: C.w, height: C.h, rx: 9, fill: t.glass2, stroke: t.line2 }));
    out.push(el('rect', { x: C.x, y: C.y, width: C.w, height: C.h, rx: 9, fill: `url(#${grid})` }));
    const handle = (x, y, c) => el('rect', { x: f(x - 2.5), y: f(y - 2.5), width: 5, height: 5, fill: t.bg, stroke: c, 'stroke-width': 1.2 });

    const rx = C.x + 14;
    const ry = C.y + 30;
    out.push(
      el('g', { class: 'rr' }, [
        el('rect', { x: rx, y: ry, width: 60, height: 34, fill: t.cyan, 'fill-opacity': 0.1, stroke: t.cyan, 'stroke-width': 1.3 }),
        el('path', { d: `M${rx + 30} ${ry}v-10`, stroke: t.cyan, 'stroke-width': 1.2 }),
        el('circle', { cx: rx + 30, cy: ry - 12, r: 2.6, fill: t.bg, stroke: t.cyan, 'stroke-width': 1.2 }),
        ...[[0, 0], [60, 0], [60, 34], [0, 34]].map(([dx, dy]) => handle(rx + dx, ry + dy, t.cyan)),
      ]),
    );
    const cx = C.x + 104;
    const cy = C.y + 32;
    out.push(el('circle', { cx, cy, r: 17, fill: t.violet2, 'fill-opacity': 0.1, stroke: t.violet2, 'stroke-width': 1.3 }));
    out.push(el('path', { d: `M${cx - 4} ${cy}h8M${cx} ${cy - 4}v8`, stroke: t.violet2 }));
    out.push(handle(cx + 17, cy, t.violet2));
    const poly = [[86, 66], [116, 60], [126, 80], [106, 94], [84, 88]].map(([x, y]) => [C.x + x, C.y + y]);
    out.push(el('path', { d: `M${poly.map((p) => p.join(' ')).join('L')}Z`, fill: t.rose, 'fill-opacity': 0.1, stroke: t.rose, 'stroke-width': 1.3, 'stroke-linejoin': 'round' }));
    poly.forEach(([x, y]) => out.push(handle(x, y, t.rose)));
    out.push(doc.text('x 312  y 188  gray 127', { x: B.x + 1, y: B.y + 118, ...mono(7, t.ink3, { tracking: 0.04 }) }));
    return out.join('');
  },

  // env-setup: the LLM test-dev server — serving, evaluation and cache units.
  rack(doc, t, a, B) {
    doc.css(
      '.led{animation:led 1.6s steps(1) infinite}@keyframes led{50%{opacity:.3}}' +
        '.eq{transform-box:fill-box;transform-origin:bottom;animation:eq .9s ease-in-out infinite alternate}@keyframes eq{from{transform:scaleY(.25)}}',
    );
    const out = [el('rect', { x: B.x, y: B.y + 2, width: B.w, height: 100, rx: 9, fill: t.lens.rim, stroke: t.line2 })];
    [['VLLM SERVE'], ['LM-EVAL', 'HARNESS'], ['HF CACHE', '100 GB QUOTA']].forEach(([name, meta], i) => {
      const y = B.y + 10 + i * 30;
      out.push(el('rect', { x: B.x + 8, y, width: B.w - 16, height: 24, rx: 5, fill: '#161927', stroke: '#fff', 'stroke-opacity': 0.07 }));
      out.push(el('circle', { cx: B.x + 18, cy: y + 12, r: 2.6, fill: '#4ADE80', class: 'led', style: `animation-delay:${-i * 0.55}s` }));
      out.push(doc.text(name, { x: B.x + 27, y: y + 15, ...mono(7, '#fff', { opacity: 0.85, stack: 'monoMd' }) }));
      if (meta) {
        out.push(doc.text(meta, { x: B.x + B.w - 15, y: y + 15, ...mono(6.5, '#fff', { opacity: 0.45, anchor: 'end', tracking: 0.06 }) }));
        return;
      }
      // Live request traffic on the serving unit.
      for (let k = 0; k < 6; k++) {
        out.push(el('rect', { x: B.x + B.w - 46 + k * 5, y: y + 6, width: 3, height: 12, rx: 1, fill: a, class: 'eq', style: `animation-delay:${f(-k * 0.17)}s` }));
      }
    });
    out.push(icon(doc, 'clock', { x: B.x + 1, y: B.y + 109, size: 11, color: a, sw: 1.4 }));
    out.push(doc.text('RESTORE IN 10 MIN', { x: B.x + 16, y: B.y + 118, ...mono(7, t.ink3, { tracking: 0.08 }) }));
    return out.join('');
  },

  // vLLM Lab: continuous batching lanes over a paged KV cache.
  batching(doc, t, a, B) {
    const out = [];
    doc.css('.kv{animation:kv 3.2s ease-in-out infinite}@keyframes kv{50%{opacity:.25}}');
    out.push(doc.text('KV CACHE · PAGED', { x: B.x, y: B.y + 8, ...mono(6.5, t.ink3) }));
    const filled = [1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0];
    filled.forEach((on, i) => {
      const c = i % 10;
      const r = Math.floor(i / 10);
      out.push(el('rect', {
        x: B.x + c * 13.8, y: B.y + 14 + r * 11, width: 10.5, height: 8, rx: 2,
        fill: on ? a : t.glass2, 'fill-opacity': on ? 0.75 : 1, stroke: on ? undefined : t.line2,
        class: on && i % 7 === 3 ? 'kv' : undefined, style: on && i % 7 === 3 ? `animation-delay:${-i * 0.3}s` : undefined,
      }));
    });

    // Request lanes: a repeating pattern drawn twice and slid by one period.
    const clip = doc.uid('lc');
    const lanesY = B.y + 58;
    doc.def(`<clipPath id="${clip}"><rect x="${B.x}" y="${lanesY - 2}" width="${B.w}" height="64"/></clipPath>`);
    const widths = [[26, 14, 38, 20, 30], [18, 34, 12, 28, 24], [40, 16, 22, 30, 14], [12, 28, 26, 18, 34]];
    const g = `url(#${brand(doc, t, {})})`;
    const lanes = widths.map((ws, li) => {
      const period = ws.reduce((s, w) => s + w + 5, 0);
      const blocks = [];
      for (let rep = 0; rep < 3; rep++) {
        let x = B.x + rep * period - li * 9;
        ws.forEach((w, k) => {
          blocks.push(el('rect', { x, y: lanesY + li * 15, width: w, height: 9, rx: 3, fill: (k + li) % 3 ? t.glass2 : g, stroke: (k + li) % 3 ? t.line3 : undefined }));
          x += w + 5;
        });
      }
      const cls = doc.uid('ln');
      doc.css(`.${cls}{animation:${cls} ${f(period / 14)}s linear infinite}@keyframes ${cls}{to{transform:translateX(-${period}px)}}`);
      return el('g', { class: cls }, blocks);
    });
    out.push(el('g', { 'clip-path': `url(#${clip})` }, lanes));
    out.push(doc.text('CONTINUOUS BATCHING', { x: B.x, y: B.y + 128, ...mono(6.5, t.ink3) }));
    return out.join('');
  },
};

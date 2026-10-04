// 04 · Telemetry — live GitHub activity, rebuilt daily by the workflow.
// Forms follow the dataviz method: a KPI row of stat tiles, a single-series
// area chart for weekly contributions, and a stacked bar for the language mix.
// Every value is also directly labelled (SVGs on GitHub can't show tooltips),
// and <desc> carries the full numbers as the text alternative.

import { Doc, el, f } from '../lib/svg.mjs';
import { frame, glass, header, icon, linear, centerY, fmt, languageSlots, langColor } from '../theme.mjs';

const W = 860;
const H = 456;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const compact = (n) => (n >= 10000 ? `${+(n / 1000).toFixed(1)}K` : fmt(n));
const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

export function telemetry(ts, t, { config, data }) {
  const mix = languageMix(config, data);
  const doc = new Doc(ts, { width: W, height: H, title: `${config.wordmark} — telemetry`, desc: summary(data, mix) });
  const dark = t.name === 'dark';
  const { back, front } = frame(doc, t, {
    glows: [
      { cx: 200, cy: 330, rx: 360, ry: 220, color: t.aurora.cyan, o: dark ? 0.2 : 0.5, drift: [26, -14], dur: 29 },
      { cx: 760, cy: 120, rx: 300, ry: 200, color: t.aurora.violet, o: dark ? 0.26 : 0.55, drift: [-22, 18], dur: 25 },
    ],
  });

  const top = data.commitsByRepo[0];
  const topTitle = top && (config.projects.find((p) => p.repo === top.name)?.title ?? top.name);
  const kpis = [
    { label: 'Contributions', value: data.contributions.total, sub: 'past 12 months', spark: monthly(data.days) },
    { label: 'Commits', value: data.contributions.commits, sub: top ? `most in ${topTitle} · ${fmt(top.commits)}` : 'past 12 months' },
    { label: 'Peak day', value: data.peak.count, sub: data.peak.date ? longDate(data.peak.date) : 'no activity yet' },
    { label: 'Last 30 days', value: data.last30, delta: data.last30 - data.prev30 },
  ];

  const out = [back, header(doc, t, { x: 24, y: 36, w: W - 48, index: '04', title: 'TELEMETRY', meta: `LIVE · SYNCED ${data.syncedAt} UTC`, dot: t.signal })];
  const gap = 12;
  const kw = (W - 48 - gap * 3) / 4;
  kpis.forEach((k, i) => out.push(statTile(doc, t, k, { x: 24 + i * (kw + gap), y: 56, w: kw, h: 104 })));
  out.push(weeklyChart(doc, t, data, { x: 24, y: 172, w: 528, h: 236 }));
  out.push(languageTile(doc, t, data, mix, { x: 564, y: 172, w: 272, h: 236 }));

  const foot = { size: 9.5, stack: 'mono', fill: t.ink3, tracking: 0.12 };
  out.push(doc.text(`${data.repoCount} PUBLIC REPOS · ${fmt(data.stars)} STARS · ${fmt(data.followers)} FOLLOWERS · ON GITHUB SINCE ${data.since}`, { x: 26, y: 432, ...foot }));
  out.push(doc.text('REBUILT DAILY BY GITHUB ACTIONS', { x: W - 26, y: 432, ...foot, anchor: 'end' }));
  out.push(front);
  return doc.render(out.join('\n'));
}

/* ── data shaping ──────────────────────────────────────────────────────── */

function monthly(days) {
  const sums = new Map();
  for (const d of days) sums.set(d.date.slice(0, 7), (sums.get(d.date.slice(0, 7)) ?? 0) + d.count);
  return [...sums.values()].slice(-12);
}

export function languageMix(config, data) {
  const slots = languageSlots(config, data);
  const listed = slots.map((name) => ({ name, share: data.languages.find((l) => l.name === name)?.share ?? 0 }));
  const rest = data.languages.filter((l) => !slots.includes(l.name));
  return { slots, listed, other: { count: rest.length, share: rest.reduce((a, l) => a + l.share, 0) } };
}

const pct = (share) => `${(share * 100).toFixed(1)}%`;

function summary(data, mix) {
  return [
    `Contributions, past 12 months: ${data.contributions.total}.`,
    `Commits: ${data.contributions.commits}.`,
    data.peak.date ? `Peak day: ${data.peak.count} on ${longDate(data.peak.date)}.` : '',
    `Last 30 days: ${data.last30} (prior 30 days: ${data.prev30}).`,
    `Weekly contributions, oldest to newest: ${data.weeks.map((w) => w.count).join(', ')}.`,
    `Language mix by bytes: ${[...mix.listed.map((l) => `${l.name} ${pct(l.share)}`), `Other ${pct(mix.other.share)}`].join(', ')}.`,
  ].join(' ');
}

/* ── stat tile ─────────────────────────────────────────────────────────── */

function statTile(doc, t, k, b) {
  const out = [glass(doc, t, { ...b, r: 16 })];
  out.push(doc.text(k.label, { x: b.x + 16, y: b.y + 27, size: 12, stack: 'sans', fill: t.ink3 }));
  out.push(doc.text(compact(k.value), { x: b.x + 15, y: b.y + 68, size: 34, stack: 'sansSb', fill: t.ink, tracking: -0.02 }));
  if (k.delta !== undefined) {
    const up = k.delta > 0;
    const color = k.delta === 0 ? t.ink3 : up ? t.up : t.down;
    const text = k.delta === 0 ? 'no change vs prior 30 days' : `${up ? '+' : '−'}${fmt(Math.abs(k.delta))} vs prior 30 days`;
    if (k.delta !== 0) out.push(icon(doc, up ? 'up' : 'down', { x: b.x + 15, y: b.y + 79, size: 11, color, sw: 1.8 }));
    out.push(doc.text(text, { x: b.x + (k.delta ? 30 : 16), y: b.y + 89, size: 11.5, stack: 'sansMd', fill: color }));
  } else {
    out.push(doc.text(doc.ts.ellipsize(k.sub, { maxWidth: b.w - 32, size: 11.5, stack: 'sans' }), { x: b.x + 16, y: b.y + 89, size: 11.5, stack: 'sans', fill: t.ink3 }));
  }
  if (k.spark) out.push(sparkline(doc, t, k.spark, { x: b.x + b.w - 92, y: b.y + 40, w: 74, h: 26 }));
  return out.join('');
}

// 12-point trend in the de-emphasis hue; the current month carries the accent.
function sparkline(doc, t, values, b) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [b.x + (i * b.w) / (values.length - 1), b.y + b.h - (v / max) * b.h]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join('');
  const [lx, ly] = pts.at(-1);
  const [px, py] = pts.at(-2);
  return [
    el('path', { d, fill: 'none', stroke: t.ink4, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    el('path', { d: `M${f(px)} ${f(py)}L${f(lx)} ${f(ly)}`, stroke: t.series[0], 'stroke-width': 2, 'stroke-linecap': 'round' }),
    el('circle', { cx: f(lx), cy: f(ly), r: 6, fill: t.surface }),
    el('circle', { cx: f(lx), cy: f(ly), r: 4, fill: t.series[0] }),
  ].join('');
}

/* ── weekly contributions (single-series area) ─────────────────────────── */

function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw);
}

function weeklyChart(doc, t, data, b) {
  const out = [glass(doc, t, { ...b, r: 16 })];
  const series = t.series[0];
  out.push(doc.text('Weekly contributions', { x: b.x + 18, y: b.y + 28, size: 13, stack: 'sansMd', fill: t.ink }));
  out.push(doc.text(`Last ${data.weeks.length} weeks · public activity`, { x: b.x + 18, y: b.y + 46, size: 11.5, stack: 'sans', fill: t.ink3 }));

  const values = data.weeks.map((w) => w.count);
  const max = Math.max(...values, 1);
  const step = niceStep(max / 3);
  const ceil = step * Math.ceil(max / step);
  // The right margin keeps room for the end-of-line label.
  const p = { x0: b.x + 52, x1: b.x + b.w - 74, y0: b.y + 76, y1: b.y + b.h - 36 };
  const X = (i) => p.x0 + (i * (p.x1 - p.x0)) / (values.length - 1);
  const Y = (v) => p.y1 - (v / ceil) * (p.y1 - p.y0);

  // Recessive solid hairline grid with clean, comma'd ticks.
  for (let v = 0; v <= ceil; v += step) {
    out.push(el('rect', { x: p.x0, y: f(Y(v) - 0.5), width: f(p.x1 - p.x0), height: 1, fill: v ? t.line2 : t.line3 }));
    out.push(doc.text(fmt(v), { x: p.x0 - 10, y: Y(v) + 3.5, size: 9.5, stack: 'mono', fill: t.ink3, anchor: 'end' }));
  }
  // Month ticks at the first week of each month.
  let lastLabel = -Infinity;
  data.weeks.forEach((w, i) => {
    const m = Number(w.start.slice(5, 7));
    if (i && m === Number(data.weeks[i - 1].start.slice(5, 7))) return;
    const x = X(i);
    if (x - lastLabel < 30 || x > p.x1 - 12) return;
    out.push(doc.text(MONTHS[m - 1], { x, y: p.y1 + 20, size: 9.5, stack: 'mono', fill: t.ink3, anchor: 'middle' }));
    lastLabel = x;
  });

  const pts = values.map((v, i) => [X(i), Y(v)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
  const wash = linear(doc, [[0, series, t.name === 'dark' ? 0.2 : 0.16], [1, series, 0.02]], { x2: 0, y2: 1 });
  out.push(el('path', { d: `${line}L${f(p.x1)} ${f(p.y1)}L${f(p.x0)} ${f(p.y1)}Z`, fill: `url(#${wash})` }));
  // Data stays static: an entrance animation would hide it in any still frame.
  out.push(el('path', { d: line, fill: 'none', stroke: series, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

  // Selective direct labels: the peak week (level with its point, on the side
  // the line can't reach) and this week's value at the end of the line.
  const marker = ([x, y]) => el('circle', { cx: f(x), cy: f(y), r: 6, fill: t.surface }) + el('circle', { cx: f(x), cy: f(y), r: 4, fill: series });
  const last = values.length - 1;
  const peak = values.indexOf(max);
  if (peak !== last && max > 0) {
    const [x, y] = pts[peak];
    const text = `peak ${fmt(max)}`;
    const left = x - 12 - doc.ts.measure(text, { size: 11, stack: 'sansMd' }) > p.x0;
    out.push(marker(pts[peak]));
    out.push(doc.text(text, { x: left ? x - 12 : x + 12, y: y + 4, size: 11, stack: 'sansMd', fill: t.ink, anchor: left ? 'end' : 'start' }));
  }
  const [lx, ly] = pts[last];
  const ty = Math.min(ly + 1, p.y1 - 16);
  out.push(marker(pts[last]));
  out.push(doc.text(fmt(values[last]), { x: lx + 12, y: ty, size: 12.5, stack: 'sansSb', fill: t.ink }));
  out.push(doc.text('this week', { x: lx + 12, y: ty + 14, size: 10.5, stack: 'sans', fill: t.ink3 }));
  return out.join('');
}

/* ── language mix (stacked bar + legend) ───────────────────────────────── */

// Bar segment, square at the baseline and 4px-rounded at the data end.
const segment = (x, y, w, h, roundRight) =>
  roundRight
    ? `M${f(x)} ${f(y)}H${f(x + w - 4)}A4 4 0 0 1 ${f(x + w)} ${f(y + 4)}V${f(y + h - 4)}A4 4 0 0 1 ${f(x + w - 4)} ${f(y + h)}H${f(x)}Z`
    : `M${f(x)} ${f(y)}h${f(w)}v${h}h${f(-w)}Z`;

function languageTile(doc, t, data, mix, b) {
  const out = [glass(doc, t, { ...b, r: 16 })];
  out.push(doc.text('Language mix', { x: b.x + 18, y: b.y + 28, size: 13, stack: 'sansMd', fill: t.ink }));
  out.push(doc.text(`By bytes · ${data.repoCount} public repositories`, { x: b.x + 18, y: b.y + 46, size: 11.5, stack: 'sans', fill: t.ink3 }));

  const rows = [
    ...mix.listed.map((l) => ({ ...l, color: langColor(t, mix.slots, l.name) })),
    { name: 'Other', share: mix.other.share, color: t.other, note: `${mix.other.count} languages` },
  ].filter((r) => r.share > 0);
  const bar = { x: b.x + 18, y: b.y + 66, w: b.w - 36, h: 12 };
  const gaps = 2 * (rows.length - 1);
  let x = bar.x;
  rows.forEach((r, i) => {
    const w = (bar.w - gaps) * r.share;
    out.push(el('path', { d: segment(x, bar.y, w, bar.h, i === rows.length - 1), fill: r.color }));
    x += w + 2;
  });

  rows.forEach((r, i) => {
    const y = b.y + 104 + i * 24;
    out.push(el('rect', { x: b.x + 18, y: y - 9, width: 10, height: 10, rx: 3, fill: r.color }));
    out.push(doc.text(r.name, { x: b.x + 36, y, size: 12.5, stack: 'sans', fill: t.ink }));
    if (r.note) out.push(doc.text(r.note, { x: b.x + 40 + doc.ts.measure(r.name, { size: 12.5, stack: 'sans' }), y, size: 11, stack: 'sans', fill: t.ink3 }));
    out.push(doc.text(pct(r.share), { x: b.x + b.w - 18, y, size: 11.5, stack: 'mono', fill: t.ink2, anchor: 'end' }));
  });
  return out.join('');
}

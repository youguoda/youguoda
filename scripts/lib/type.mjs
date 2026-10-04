// Typesetter: lays text out with real font metrics and emits glyph outlines.
//
// Rendering runs twice. The first pass only *collects* which characters each
// face must provide (measurements are estimated); then `load()` downloads exact
// subsets and the second pass produces the final artwork.

import { f, el } from './svg.mjs';
import { loadGoogleFont } from './fonts.mjs';

const BASE_CHARS =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~·—–…“”‘’×';
const WIDE = /[⺀-鿿豈-﫿＀-￯　-〿]/;
// Characters that must not start a line in CJK typesetting.
const NO_LINE_START = /[，。、；：！？）》」』】,.;:!?)\]]/;

// Serialises opentype.js path commands as compact relative path data. (Its own
// toPathData() drops the separator when a negative coordinate rounds to 0,
// corrupting the outline.) Deltas are taken between already-rounded points, so
// rounding error never accumulates along a contour.
function pathData(commands, digits) {
  const k = 10 ** digits;
  const round = (v) => Math.round(v * k) / k;
  const num = (v) => String(round(v) || 0).replace(/^(-?)0\./, '$1.');
  let d = '';
  let [cx, cy, sx, sy] = [0, 0, 0, 0];
  for (const c of commands) {
    if (c.type === 'Z') {
      d += 'z';
      [cx, cy] = [sx, sy];
      continue;
    }
    const abs = (c.type === 'C' ? [c.x1, c.y1, c.x2, c.y2, c.x, c.y] : c.type === 'Q' ? [c.x1, c.y1, c.x, c.y] : [c.x, c.y]).map(round);
    // The leading moveto stays absolute so outlines can be concatenated safely.
    d += d ? c.type.toLowerCase() : c.type;
    abs.forEach((v, i) => {
      const s = num(v - (i % 2 ? cy : cx));
      d += i && s[0] !== '-' ? ` ${s}` : s;
    });
    [cx, cy] = abs.slice(-2);
    if (c.type === 'M') [sx, sy] = [cx, cy];
  }
  return d;
}

export class Typesetter {
  constructor(faces, stacks) {
    this.faces = faces;
    this.stacks = stacks;
    this.fonts = null;
    this.wanted = new Map(Object.keys(faces).map((k) => [k, new Set(BASE_CHARS)]));
    this.paths = new Map();
    this.missing = new Set();
  }

  get ready() {
    return this.fonts !== null;
  }

  async load() {
    const fonts = {};
    await Promise.all(
      Object.entries(this.faces).map(async ([key, { family, weight }]) => {
        fonts[key] = await loadGoogleFont(family, weight, [...this.wanted.get(key)].join(''));
      }),
    );
    this.fonts = fonts;
  }

  // → [{ key, glyph, x }] in px from the run origin, plus total advance width.
  layout(str, { size, stack = 'sans', tracking = 0 }) {
    const faces = this.stacks[stack];
    if (!faces) throw new Error(`Unknown font stack "${stack}"`);
    const items = [];
    let x = 0;
    let prev = null;
    for (const c of String(str)) {
      if (!this.ready) {
        for (const k of faces) this.wanted.get(k).add(c);
        items.push({ key: faces[0], glyph: null, x });
        x += (WIDE.test(c) ? 1 : 0.58) * size + tracking * size;
        continue;
      }
      const key = faces.find((k) => this.fonts[k].charToGlyphIndex(c) > 0);
      if (!key) {
        this.missing.add(`${c} (U+${c.codePointAt(0).toString(16)}) in ${stack}`);
        prev = null;
        continue;
      }
      const font = this.fonts[key];
      const glyph = font.charToGlyph(c);
      const scale = size / font.unitsPerEm;
      if (prev && prev.key === key) x += font.getKerningValue(prev.glyph, glyph) * scale;
      items.push({ key, glyph, x });
      x += glyph.advanceWidth * scale + tracking * size;
      prev = { key, glyph };
    }
    return { items, width: items.length ? x - tracking * size : 0 };
  }

  measure(str, opts) {
    return this.layout(str, opts).width;
  }

  capHeight(stack, size) {
    if (!this.ready) return size * 0.7;
    const font = this.fonts[this.stacks[stack][0]];
    const cap = font.tables.os2?.sCapHeight || font.ascender * 0.7;
    return (cap / font.unitsPerEm) * size;
  }

  // Outline normalised to a 1000-unit em, cached across documents.
  #outline(key, glyph) {
    const k = `${key}:${glyph.index}`;
    if (!this.paths.has(k)) this.paths.set(k, pathData(glyph.getPath(0, 0, 1000).commands, 0));
    return { k, d: this.paths.get(k) };
  }

  #origin(str, { x = 0, anchor = 'start', ...opts }) {
    const run = this.layout(str, opts);
    const dx = anchor === 'middle' ? run.width / 2 : anchor === 'end' ? run.width : 0;
    return { run, x0: x - dx };
  }

  // Default output: a group of <use> references into the document's glyph atlas.
  render(doc, str, { y = 0, size, fill, opacity, cls, style, ...opts }) {
    const { run, x0 } = this.#origin(str, { size, ...opts });
    if (!this.ready) return '';
    const s = size / 1000;
    const uses = [];
    for (const it of run.items) {
      const { k, d } = this.#outline(it.key, it.glyph);
      if (!d) continue; // whitespace
      const ux = f(it.x / s);
      uses.push(`<use href="#${doc.glyphRef(k, d)}"${ux ? ` x="${ux}"` : ''}/>`);
    }
    return el('g', { transform: `translate(${f(x0)} ${f(y)}) scale(${s})`, fill, opacity, class: cls, style }, uses);
  }

  // A single merged outline — for gradient fills, clip paths and masks.
  path(str, { y = 0, size, ...opts }) {
    const { run, x0 } = this.#origin(str, { size, ...opts });
    if (!this.ready) return { d: 'M0 0', width: run.width, x: x0 };
    const d = run.items.map((it) => pathData(it.glyph.getPath(x0 + it.x, y, size).commands, 2)).join('');
    return { d, width: run.width, x: x0 };
  }

  // Greedy line breaking: CJK may break between any two characters, Latin at spaces.
  wrap(str, { maxWidth, maxLines = Infinity, ...opts }) {
    const tokens = String(str).match(/[⺀-鿿豈-﫿＀-￯　-〿]|[^\s⺀-鿿豈-﫿＀-￯　-〿]+|\s+/g) ?? [];
    const lines = [];
    let line = '';
    for (const tok of tokens) {
      const next = line + tok;
      if (!line || this.measure(next.trimEnd(), opts) <= maxWidth || NO_LINE_START.test(tok)) {
        line = next;
        continue;
      }
      lines.push(line.trimEnd());
      line = tok.trimStart();
    }
    if (line.trim()) lines.push(line.trimEnd());
    if (lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      kept[maxLines - 1] = this.ellipsize(lines.slice(maxLines - 1).join(' '), { maxWidth, ...opts });
      return kept;
    }
    return lines;
  }

  ellipsize(str, { maxWidth, ...opts }) {
    if (this.measure(str, opts) <= maxWidth) return str;
    const chars = [...str];
    while (chars.length && this.measure(chars.join('').trimEnd() + '…', opts) > maxWidth) chars.pop();
    return chars.join('').trimEnd() + '…';
  }
}

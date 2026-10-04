// Minimal SVG document model. Each panel is one Doc: it collects <defs>, CSS and
// the glyph outlines its text needs, then serialises to a standalone SVG.

export const f = (v) => Math.round(v * 100) / 100;

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? f(v) : esc(v)}"`)
    .join('');

export const el = (tag, a = {}, children) =>
  children === undefined ? `<${tag}${attrs(a)}/>` : `<${tag}${attrs(a)}>${[children].flat().join('')}</${tag}>`;

// Rounded-rect path, so shapes can be reused in clipPaths, masks and strokes alike.
export function rrect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
}

export class Doc {
  constructor(ts, { width, height, title, desc = '' }) {
    Object.assign(this, { ts, width, height, title, desc });
    this.defs = [];
    this.styles = [];
    this.glyphs = new Map();
    this.shared = new Map();
    this.n = 0;
  }

  uid(prefix = 'u') {
    return `${prefix}${(this.n++).toString(36)}`;
  }

  // Registers a shared resource (gradient, keyframes…) once and returns its value.
  once(key, make) {
    if (!this.shared.has(key)) this.shared.set(key, make());
    return this.shared.get(key);
  }

  def(markup) {
    this.defs.push(markup);
  }

  css(rules) {
    this.styles.push(rules);
  }

  // Glyph outlines are defined once per document and placed with <use>.
  glyphRef(key, d) {
    let id = this.glyphs.get(key);
    if (!id) {
      id = `g${this.glyphs.size.toString(36)}`;
      this.glyphs.set(key, id);
      this.def(`<path id="${id}" d="${d}"/>`);
    }
    return id;
  }

  text(str, opts) {
    return this.ts.render(this, str, opts);
  }

  render(body) {
    const { width: w, height: h } = this;
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">`,
      `<title id="t">${esc(this.title)}</title><desc id="d">${esc(this.desc)}</desc>`,
      `<style>${this.styles.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`,
      `<defs>${this.defs.join('')}</defs>`,
      body,
      '</svg>',
    ].join('\n');
  }
}

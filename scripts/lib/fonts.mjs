// Font pipeline: fetches static TrueType subsets from the Google Fonts CSS API
// (only the characters we actually render) and parses them with opentype.js.
// Glyph outlines are later inlined as SVG paths, so every viewer sees the exact
// same typography — SVGs rendered through <img> cannot load web fonts.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';

const CACHE_DIR = new URL('../../.cache/fonts/', import.meta.url);
// A non-browser UA makes the CSS API answer with TrueType instead of WOFF2.
const UA = { 'User-Agent': 'curl/8.0' };

export async function loadGoogleFont(family, weight, text) {
  const chars = [...new Set(text)].sort().join('');
  const key = createHash('sha1').update(`${family}|${weight}|${chars}`).digest('hex').slice(0, 16);
  const file = new URL(`${family.replace(/\W+/g, '-')}-${weight}-${key}.ttf`, CACHE_DIR);

  let buf;
  try {
    buf = await readFile(file);
  } catch {
    const query = `family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(chars)}`;
    const css = await fetchText(`https://fonts.googleapis.com/css2?${query}`);
    const url = css.match(/url\(([^)]+)\)\s*format\('truetype'\)/)?.[1];
    if (!url) throw new Error(`Google Fonts returned no TrueType source for ${family} ${weight}`);
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`Font download failed (${res.status}) for ${family} ${weight}`);
    buf = Buffer.from(await res.arrayBuffer());
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, buf);
  }
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

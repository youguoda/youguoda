// Icons. UI glyphs are hand-drawn strokes on a 24-unit grid; brand marks come
// from Simple Icons / Devicon (pinned versions) and are cached after first use.

import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CACHE_DIR = new URL('../../.cache/icons/', import.meta.url);
const SOURCES = {
  si: (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@16.34.0/icons/${slug}.svg`,
  devicon: (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/${path}.svg`,
};

// Stroke icons (24×24). Rendered with non-scaling strokes so weight stays crisp.
export const UI = {
  search: 'M10.5 4.5a6 6 0 1 1 0 12a6 6 0 0 1 0-12zM15 15l4.5 4.5',
  command:
    'M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0H9m6 0v2.5a2.5 2.5 0 1 0 2.5-2.5H15zm-6 0v2.5A2.5 2.5 0 1 1 6.5 15H9z',
  enter: 'M19.5 5v6.5a3 3 0 0 1-3 3H5m0 0l4-4m-4 4l4 4',
  up: 'M12 19V5.5M6.5 11L12 5.5 17.5 11',
  down: 'M12 5v13.5M6.5 13l5.5 5.5 5.5-5.5',
  arrowUpRight: 'M7 17L17 7M8.5 7H17v8.5',
  scan: 'M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6z',
  bolt: 'M13 2.5L4.5 13.5H11.5l-1 8 9-11.5H12.5l.5-7.5z',
  sparkle: 'M11 3.5l1.9 5.6 5.6 1.9-5.6 1.9L11 18.5l-1.9-5.6L3.5 11l5.6-1.9zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  monitor: 'M3.5 6A1.5 1.5 0 0 1 5 4.5h14A1.5 1.5 0 0 1 20.5 6v8.5A1.5 1.5 0 0 1 19 16H5a1.5 1.5 0 0 1-1.5-1.5zM8.5 19.5h7M12 16v3.5',
  chip: 'M7 7h10v10H7zM10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5',
  layers: 'M12 3.5l8.5 4.5-8.5 4.5L3.5 8zM3.5 12l8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5',
  terminal: 'M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5zM7.5 9l3 3-3 3M12.5 15.5h4',
  camera: 'M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.5h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5zM12 9.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7z',
  aperture: 'M12 3.4a8.6 8.6 0 1 1 0 17.2a8.6 8.6 0 1 1 0 -17.2zM12 7.8L20.57 12.75M15.64 9.9L15.64 19.79M15.64 14.1L7.07 19.05M12 16.2L3.43 11.25M8.36 14.1L8.36 4.21M8.36 9.9L16.93 4.95',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  checklist: 'M4 6.5l1.6 1.6L8.8 5M4 12.5l1.6 1.6 3.2-3.1M4 18.5l1.6 1.6 3.2-3.1M12 6.5h8M12 12.5h8M12 18.5h8',
  gauge: 'M3.5 17a8.5 8.5 0 0 1 17 0M12 17l4-5M12 15.8a1.2 1.2 0 1 1 0 2.4a1.2 1.2 0 0 1 0-2.4z',
  flask: 'M9.5 3.5h5M10.5 3.5V9L5 18.6a1.3 1.3 0 0 0 1.1 1.9h11.8a1.3 1.3 0 0 0 1.1-1.9L13.5 9V3.5M7.6 14.5h8.8',
  sglang: 'M17 6.5H9.75a3.25 3.25 0 0 0 0 6.5h4.5a3.25 3.25 0 0 1 0 6.5H7',
  image: 'M4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5zM3.5 16l5-5 4 4 2.5-2.5L21 18M15.5 8.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3z',
  star: 'M12 3.8l2.5 5.1 5.6.8-4.05 3.95.95 5.6L12 16.6l-5 2.65.95-5.6L3.9 9.7l5.6-.8z',
  fork: 'M6.5 3.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4zM17.5 3.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4zM12 16.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4zM6.5 7.5v1a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-1M12 11.5v5',
  clock: 'M12 3.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17zM12 7.5V12l3 2',
  commit: 'M12 8.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zM3 12h5.5M15.5 12H21',
  pulse: 'M3 12h3.5l2.5-6 5 12 2.5-6H21',
  vllm: 'M3.5 5l8.5 14.5L20.5 5M8 5l4 7 4-7',
  windows: 'M4 4h7.5v7.5H4zM12.5 4H20v7.5h-7.5zM4 12.5h7.5V20H4zM12.5 12.5H20V20h-7.5z',
};

// Filled UI marks (no stroke).
export const FILLED = new Set(['windows']);

export async function loadBrand(ref) {
  const [src, id] = ref.split(':');
  const file = new URL(`${src}-${id.replace(/\W+/g, '-')}.svg`, CACHE_DIR);
  let svg;
  try {
    svg = await readFile(file, 'utf8');
  } catch {
    const res = await fetch(SOURCES[src](id));
    if (!res.ok) throw new Error(`Icon ${ref} → HTTP ${res.status}`);
    svg = await res.text();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, svg);
  }
  const vb = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1] ?? 24);
  const d = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]).join('');
  return { d, vb };
}

// Builds every profile panel (dark + light), then README.md.
//   npm run build     → assets/*.svg + README.md
//   npm run preview   → also writes .cache/preview.html for local review

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import config from '../profile.config.mjs';
import { Typesetter } from './lib/type.mjs';
import { loadProfile } from './lib/github.mjs';
import { loadBrand } from './lib/icons.mjs';
import { FACES, STACKS, THEMES, BRANDS } from './theme.mjs';
import { readme, slug } from './readme.mjs';
import { hero } from './render/hero.mjs';
import { identity } from './render/identity.mjs';
import { stack } from './render/stack.mjs';
import { project, workHeader } from './render/project.mjs';
import { telemetry } from './render/telemetry.mjs';
import { footer } from './render/footer.mjs';

const ROOT = new URL('../', import.meta.url);
const ASSETS = new URL('assets/', ROOT);

// Panel list in page order. Each entry renders one SVG per theme.
const panels = (config) => [
  { name: 'hero', render: hero },
  { name: 'identity', render: identity },
  { name: 'stack', render: stack },
  { name: 'work', render: workHeader },
  ...config.projects.map((p, index) => ({ name: `project-${slug(p.repo)}`, render: project, props: { project: p, index } })),
  { name: 'telemetry', render: telemetry },
  { name: 'footer', render: footer },
];

function renderAll(ts, ctx) {
  const files = new Map();
  for (const p of panels(ctx.config)) {
    for (const t of Object.values(THEMES)) files.set(`${p.name}-${t.name}.svg`, p.render(ts, t, { ...ctx, ...p.props }));
  }
  return files;
}

async function loadIcons(config) {
  const refs = new Set(config.stack.flatMap((l) => l.items.map(([ref]) => ref)).filter((r) => !r.startsWith('ui:')));
  await Promise.all([...refs].map(async (ref) => BRANDS.set(ref, await loadBrand(ref))));
}

async function main() {
  const [data] = await Promise.all([loadProfile(config), loadIcons(config)]);
  const ctx = { config, data };
  const ts = new Typesetter(FACES, STACKS);
  renderAll(ts, ctx); // pass 1: collect the characters each face must provide
  await ts.load();
  const files = renderAll(ts, ctx);
  if (ts.missing.size) throw new Error(`Missing glyphs: ${[...ts.missing].join(', ')}`);

  await mkdir(ASSETS, { recursive: true });
  // Drop panels that are no longer generated (e.g. a renamed repository's card).
  for (const name of await readdir(ASSETS)) {
    if (name.endsWith('.svg') && !files.has(name)) await rm(new URL(name, ASSETS));
  }
  let bytes = 0;
  for (const [name, svg] of files) {
    await writeFile(new URL(name, ASSETS), svg);
    bytes += svg.length;
  }
  await writeFile(new URL('README.md', ROOT), readme(config, data));
  console.log(`✓ ${files.size} SVGs (${(bytes / 1024).toFixed(0)} KB) → assets/ · README.md`);

  if (process.argv.includes('--preview')) {
    await mkdir(new URL('.cache/', ROOT), { recursive: true });
    await writeFile(new URL('.cache/preview.html', ROOT), preview(config));
    console.log('✓ preview → .cache/preview.html');
  }
}

// GitHub-like page shells (dark and light) for eyeballing the assets locally.
function preview(config) {
  const col = (theme, bg) =>
    `<section style="background:${bg}"><div class="box">${panels(config)
      .map((p) => `<img src="../assets/${p.name}-${theme}.svg" class="${p.name.startsWith('project-') ? 'half' : 'full'}">`)
      .join('')}</div></section>`;
  return `<!doctype html><meta charset="utf-8"><title>Profile preview</title>
<style>body{margin:0;display:flex}section{flex:1;padding:32px 0}
.box{width:846px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;row-gap:14px}
.full{width:100%}.half{width:49%}</style>
${col('dark', '#0d1117')}${col('light', '#ffffff')}`;
}

await main();

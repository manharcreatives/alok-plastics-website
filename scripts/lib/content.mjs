// Loads the typed content files (src/content/*.ts) from plain Node scripts.
// Transpiles them with the project's own TypeScript into node_modules/.cache and imports the result,
// so the generators read exactly the same data the site renders — no duplicated lists.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(ROOT, 'src', 'content');
const CACHE = join(ROOT, 'node_modules', '.cache', 'alok-content');

export async function loadContent() {
  mkdirSync(CACHE, { recursive: true });
  for (const f of readdirSync(SRC).filter(n => n.endsWith('.ts'))) {
    const out = ts.transpileModule(readFileSync(join(SRC, f), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText.replace(/(from\s+['"])(\.\/[\w-]+)(['"])/g, '$1$2.mjs$3');
    writeFileSync(join(CACHE, f.replace(/\.ts$/, '.mjs')), out);
  }
  const imp = n => import(pathToFileURL(join(CACHE, `${n}.mjs`)).href);
  const [siteM, productsM, industriesM] = await Promise.all([imp('site'), imp('products'), imp('industries')]);
  return {
    site: siteM.site,
    formatAddress: siteM.formatAddress,
    productGroups: productsM.productGroups,
    products: productsM.products,
    publishedProducts: productsM.publishedProducts,
    productsByGroup: productsM.productsByGroup,
    productPath: productsM.productPath,
    productPhoto: productsM.productPhoto,
    MATERIAL_LABELS: productsM.MATERIAL_LABELS,
    MACHINE_LABELS: productsM.MACHINE_LABELS,
    industries: industriesM.industriesConfig.industries,
  };
}

/** Static (non-dynamic, non-lab) routes found by scanning src/app for page.tsx. */
export function scanStaticRoutes() {
  const app = join(ROOT, 'src', 'app');
  const routes = [];
  (function walk(dir, segs) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (!statSync(full).isDirectory()) continue;
      if (name.startsWith('[') || name.startsWith('_') || name.startsWith('(') || name === 'lab' || name === 'api') continue;
      walk(full, [...segs, name]);
    }
    if (existsSync(join(dir, 'page.tsx'))) routes.push(segs.length ? `/${segs.join('/')}/` : '/');
  })(app, []);
  return routes.sort();
}

export function writeBoth(rel, text) {
  for (const base of [join(ROOT, 'public'), join(ROOT, 'out')]) {
    if (!existsSync(base)) continue;
    writeFileSync(join(base, rel), text);
  }
}

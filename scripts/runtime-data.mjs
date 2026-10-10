#!/usr/bin/env node
/**
 * runtime-data.mjs: keeps what the admin panel saved across a local `next build`.
 * `next build` empties out/, which would delete careers.json, products.json, uploads and the admin
 * data folder. `save` copies them to .runtime-backup/ before the build, `restore` puts them back after.
 * (On the live server nothing is wiped: upload the build without deleting data/ and admin/data/.)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
const BAK = join(ROOT, '.runtime-backup');
const mode = process.argv[2];

const files = () => (existsSync(join(OUT, 'data')) ? readdirSync(join(OUT, 'data')).filter(f => f.endsWith('.json') && !f.includes('.example.')) : []);

if (mode === 'save') {
  rmSync(BAK, { recursive: true, force: true });
  if (!existsSync(OUT)) process.exit(0);
  mkdirSync(join(BAK, 'data'), { recursive: true });
  for (const f of files()) cpSync(join(OUT, 'data', f), join(BAK, 'data', f));
  if (existsSync(join(OUT, 'admin', 'data'))) cpSync(join(OUT, 'admin', 'data'), join(BAK, 'admin-data'), { recursive: true });
  console.log('runtime-data: saved', files().length, 'data file(s) and the admin data folder');
} else if (mode === 'restore') {
  if (!existsSync(BAK)) process.exit(0);
  if (existsSync(join(BAK, 'data'))) { mkdirSync(join(OUT, 'data'), { recursive: true }); cpSync(join(BAK, 'data'), join(OUT, 'data'), { recursive: true }); }
  if (existsSync(join(BAK, 'admin-data'))) { mkdirSync(join(OUT, 'admin', 'data'), { recursive: true }); cpSync(join(BAK, 'admin-data'), join(OUT, 'admin', 'data'), { recursive: true, force: false }); }
  console.log('runtime-data: restored');
} else {
  console.error('usage: runtime-data.mjs save|restore'); process.exit(1);
}

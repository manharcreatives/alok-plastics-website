#!/usr/bin/env node
/**
 * vercel-prune.mjs: runs after `next build` ONLY on Vercel (process.env.VERCEL is set there).
 * Vercel has no PHP, so out/api, out/admin and out/data would be published as plain static files
 * (PHP source readable by anyone). vercel.json proxies /api, /admin and /data to the PHP host instead.
 */
import { rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.env.VERCEL) process.exit(0);
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
for (const dir of ['api', 'admin', 'data']) {
  if (existsSync(join(OUT, dir))) { rmSync(join(OUT, dir), { recursive: true, force: true }); console.log('vercel-prune: removed out/' + dir); }
}

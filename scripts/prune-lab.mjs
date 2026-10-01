#!/usr/bin/env node
// Removes ./out/lab unless NEXT_PUBLIC_SHOW_LAB=1.
// Under static export, notFound() in src/app/lab/layout.tsx still leaves the lab page's data in the
// 404 shell's RSC payload, so the only way to ship nothing is to delete the folder. /lab/* then
// falls through to /404.html via the .htaccess ErrorDocument.
import { existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const lab = join(dirname(fileURLToPath(import.meta.url)), '..', 'out', 'lab');
if (process.env.NEXT_PUBLIC_SHOW_LAB === '1') {
  console.log('prune-lab: NEXT_PUBLIC_SHOW_LAB=1 — keeping out/lab (noindex, not in sitemap)');
} else if (existsSync(lab)) {
  rmSync(lab, { recursive: true, force: true });
  console.log('prune-lab: removed out/lab (set NEXT_PUBLIC_SHOW_LAB=1 to keep it)');
} else {
  console.log('prune-lab: out/lab not present');
}

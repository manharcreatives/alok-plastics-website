#!/usr/bin/env node
// check-glass.mjs — Fails if backdrop-filter appears in more than 2 files under src/
// Glass is allowed ONLY in the navbar + mobile drawer (§9)
// Three backdrop-filter elements = gate failure

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

const GLASS_PATTERN = /backdrop-filter/;
const MAX_ALLOWED = 2;

function getAllFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllFiles(full));
    } else if (entry.isFile() && (
      full.endsWith('.tsx') || full.endsWith('.ts') ||
      full.endsWith('.css') || full.endsWith('.module.css')
    )) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(SRC);
const glassFiles = [];

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  if (GLASS_PATTERN.test(content)) {
    glassFiles.push(relative(ROOT, file));
  }
}

console.log(`\nbackdrop-filter found in ${glassFiles.length} file(s):`);
glassFiles.forEach(f => console.log('  ', f));

if (glassFiles.length > MAX_ALLOWED) {
  console.error(`\n✗ check-glass FAILED — backdrop-filter in ${glassFiles.length} files (max ${MAX_ALLOWED}).`);
  console.error('  Glass is allowed ONLY in the navbar + mobile drawer (§9).');
  console.error('  Glass everywhere reads as a template — see §9 for the one-glass rule.');
  process.exit(1);
} else if (glassFiles.length === 0) {
  console.log('✓ check-glass passed — no backdrop-filter found (will be added in Phase 3)');
} else {
  console.log(`✓ check-glass passed — ${glassFiles.length}/${MAX_ALLOWED} allowed glass element(s)`);
  // Verify the glass files are the right ones
  const expectedFiles = ['header', 'nav', 'drawer', 'glass-nav'];
  const unexpectedGlass = glassFiles.filter(f =>
    !expectedFiles.some(expected => f.toLowerCase().includes(expected))
  );
  if (unexpectedGlass.length > 0) {
    console.warn(`⚠ check-glass: glass found in unexpected files — verify these are the navbar/drawer only:`);
    unexpectedGlass.forEach(f => console.warn('   ', f));
  }
}

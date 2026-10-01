#!/usr/bin/env node
// check-spacing.mjs — Fails if any arbitrary spacing values appear that aren't tokens
// Specifically flags the forbidden 28–36px range (§7.4 coupling rule)
// and arbitrary px/rem values not from the token set.

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

let errors = [];
let warnings = [];

// Forbidden spacing range: 28–36px is the "ambiguous" zone (§7.4)
// These values make a page feel unconsidered — never allowed
const FORBIDDEN_PX_RANGE = { min: 28, max: 36 };

// Allowed token values (px equivalents)
const ALLOWED_SPACING_PX = new Set([4, 8, 16, 24, 40, 56, 72, 80, 96, 120, 128, 160]);

// Files/patterns to skip (e.g. tokens.css definitions are fine)
const SKIP_FILES = ['tokens.css', 'globals.css', 'typography.css'];

// Match spacing properties: padding, margin, gap, top, left, right, bottom, width, height etc.
// Only check explicit px values in style props / CSS-in-JS / Tailwind arbitrary values
const ARBITRARY_TAILWIND_RE = /\[(\d+(?:\.\d+)?)(px|rem)\]/g;
const CSS_SPACING_RE = /(?:padding|margin|gap|top|left|right|bottom|inset|translate|space)[\w-]*\s*:\s*([\d.]+)(px|rem)/g;
const INLINE_STYLE_RE = /style=\{\{[^}]+\}\}/g;

function getAllFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllFiles(full));
    } else if (entry.isFile() && (full.endsWith('.tsx') || full.endsWith('.ts') || full.endsWith('.css'))) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(SRC).filter(f => !SKIP_FILES.some(s => f.endsWith(s)));

for (const file of files) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf-8');

  // Check Tailwind arbitrary values like p-[32px] or gap-[28px]
  for (const match of content.matchAll(ARBITRARY_TAILWIND_RE)) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    const valuePx = unit === 'rem' ? value * 16 : value;

    if (valuePx >= FORBIDDEN_PX_RANGE.min && valuePx <= FORBIDDEN_PX_RANGE.max) {
      errors.push(`ERROR ${rel}: arbitrary spacing [${match[1]}${unit}] (${valuePx}px) is in the forbidden 28–36px ambiguous zone (§7.4). Use --space-md (24px) or --space-lg (40px) instead.`);
    } else if (!ALLOWED_SPACING_PX.has(valuePx)) {
      warnings.push(`WARN ${rel}: arbitrary spacing [${match[1]}${unit}] (${valuePx}px) — prefer a token value. Allowed: ${[...ALLOWED_SPACING_PX].join(', ')}px`);
    }
  }

  // Check direct CSS spacing values in stylesheet files
  if (file.endsWith('.css')) {
    for (const match of content.matchAll(CSS_SPACING_RE)) {
      const value = parseFloat(match[1]);
      const unit = match[2];
      const valuePx = unit === 'rem' ? value * 16 : value;

      if (valuePx >= FORBIDDEN_PX_RANGE.min && valuePx <= FORBIDDEN_PX_RANGE.max) {
        errors.push(`ERROR ${rel}: CSS spacing ${match[0].trim()} (${valuePx}px) is in the forbidden 28–36px ambiguous zone (§7.4).`);
      }
    }
  }
}

if (warnings.length) {
  console.warn('\n⚠ check-spacing warnings:');
  warnings.forEach(w => console.warn(' ', w));
}

if (errors.length) {
  console.error('\n✗ check-spacing FAILED — forbidden spacing values found:');
  errors.forEach(e => console.error(' ', e));
  process.exit(1);
} else {
  console.log('✓ check-spacing passed — no forbidden spacing values in the 28–36px ambiguous zone');
}

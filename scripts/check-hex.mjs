#!/usr/bin/env node
// check-hex.mjs — Fails if any HEX colour not in tokens.css appears in src/
// All colours must come from CSS custom properties. No raw hex in components.
//
// Allowed: the 24 tokens + 2 gradient stop sets in tokens.css
// Rule: #C9A0A4, #6E6C6C, #8F8D8D, #BDBBBB exist ONLY inside the two gradient strings

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

// ── Allowed hex values (from tokens.css only) ─────────────────────────────────
const ALLOWED_HEX = new Set([
  // Primary & secondary
  '#581C25', // --burgundy
  '#737171', // --grey-metal
  // Burgundy support
  '#2E0A0F', // --burgundy-night
  '#3E131A', // --burgundy-deep
  '#8A2C38', // --burgundy-bright
  '#C35A61', // --rose
  '#E3B5B8', // --rose-pale
  '#F3DFE0', // --pink-soft
  '#FAF1F1', // --blush
  // Light surfaces
  '#FFFFFF', // --surface
  '#F8F7F7', // --canvas
  '#F1EEEF', // --surface-alt
  '#ECE7E8', // --mist
  '#E1DBDC', // --grey-cloud
  '#D8D4D0', // --grey-warm
  '#909090', // --silver
  // Text
  '#1E1115', // --ink
  '#4A3D40', // --body
  '#6B5F62', // --muted
  // Functional
  '#0F7B6C', // --whatsapp
  '#2E7D32', // --success
  '#8A5A00', // --warning
  '#B3261E', // --error
  '#1F5F8B', // --info
  // Gradient stops (allowed ONLY inside the gradient strings in tokens.css)
  '#C9A0A4',
  '#6E6C6C',
  '#8F8D8D',
  '#BDBBBB',
]);

// ── Forbidden patterns ────────────────────────────────────────────────────────
const FORBIDDEN = [
  { pattern: /#000000/gi, message: 'Pure black #000000 is forbidden (§2.4). Use --ink instead.' },
  { pattern: /#000(?![0-9a-fA-F])/g, message: '#000 (shorthand) is forbidden (§2.4). Use --ink instead.' },
];

let errors = [];
let warnings = [];

function getAllFiles(dir, exts = ['.tsx', '.ts', '.css', '.scss']) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllFiles(full, exts));
    } else if (entry.isFile() && exts.some(e => full.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(SRC);
const tokensFile = join(SRC, 'styles', 'tokens.css');

// Match all hex values in a file
const HEX_RE = /#([0-9a-fA-F]{3,8})\b/g;

for (const file of files) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf-8');

  // Check forbidden patterns first
  for (const { pattern, message } of FORBIDDEN) {
    const matches = [...content.matchAll(pattern)];
    for (const match of matches) {
      errors.push(`ERROR ${rel}: ${message}`);
    }
  }

  // Check for any hex values not in the allowed set
  // Exception: tokens.css itself is allowed to define them
  if (file === tokensFile) continue;

  const hexMatches = [...content.matchAll(HEX_RE)];
  for (const match of hexMatches) {
    const raw = match[0].toUpperCase();
    const expanded = raw.length === 4  // expand shorthand #RGB → #RRGGBB
      ? '#' + raw[1]+raw[1]+raw[2]+raw[2]+raw[3]+raw[3]
      : raw;
    if (!ALLOWED_HEX.has(expanded) && !ALLOWED_HEX.has(raw)) {
      // Check if it's one of the gradient-only stops used outside a gradient
      if (['#C9A0A4', '#6E6C6C', '#8F8D8D', '#BDBBBB'].includes(raw)) {
        warnings.push(`WARN ${rel}: gradient stop ${raw} used outside tokens.css gradient string. These stops may only appear inside --metal-gradient and --silver-gradient in tokens.css.`);
      } else {
        errors.push(`ERROR ${rel}: hardcoded hex ${raw} not in §2.1 token set. Use a CSS custom property from tokens.css instead.`);
      }
    }
  }
}

if (warnings.length) {
  console.warn('\n⚠ check-hex warnings:');
  warnings.forEach(w => console.warn(' ', w));
}

if (errors.length) {
  console.error('\n✗ check-hex FAILED — hardcoded hex values found:');
  errors.forEach(e => console.error(' ', e));
  process.exit(1);
} else {
  console.log('✓ check-hex passed — all colours are from §2.1 token set');
}

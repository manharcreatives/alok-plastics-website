#!/usr/bin/env node
// check-forbidden.mjs — Fails on banned patterns in src/
// See §2.4 and §3.2 for the full forbidden list

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

// ── Forbidden patterns ────────────────────────────────────────────────────────
const FORBIDDEN = [
  // §2.4: Typography
  {
    pattern: /\b100vh\b/g,
    message: 'Use 100svh instead of 100vh — mobile Safari toolbar jump (§11.5)',
    severity: 'ERROR',
    // Exception: inside comments explaining the rule
    except: /100svh.*instead.*100vh|instead.*100vh.*100svh/i,
  },
  // §3.2: Forbidden component names / patterns
  {
    pattern: /rounded-full/g,
    message: 'rounded-full creates circles/pills — only allowed for WhatsApp FAB and the glass navbar (§3 row 8 / §9)',
    severity: 'WARN',
    allowedIn: ['Header', 'Nav', 'Drawer', 'glass-nav', 'WhatsApp', 'Fab'],
  },
  {
    pattern: /rounded-2xl|rounded-3xl/g,
    message: 'Pill-shaped cards are banned (§3 row 8). Use border-radius: 2px (--radius-card) maximum.',
    severity: 'ERROR',
  },
  // §3.2: Lorem ipsum
  {
    pattern: /lorem\s+ipsum/gi,
    message: 'Lorem ipsum found in source — remove all placeholder copy from non-_lab routes (§19)',
    severity: 'ERROR',
    // Allow in _lab routes
    except: /_lab/,
  },
  // §2.4: Blue/purple/neon
  {
    pattern: /#0000[a-fA-F0-9]{2}|#00[a-fA-F][a-fA-F][a-fA-F]{2}|\bblue-\d|\bindigo-\d|\bviolet-\d|\bpurple-\d|\bcyan-\d|\bteal-\d(?!-)/g,
    message: 'Blue/purple/cyan/teal colours are forbidden (§2.4). Only --whatsapp green is allowed.',
    severity: 'ERROR',
  },
  // §3.2: Aurora, sparkles, meteors
  {
    pattern: /\bauror[a]\b|\bsparkle|\bmeteor|\bliquid.glass|\bblob\b/gi,
    message: 'Aurora/sparkles/meteors/liquid-glass/blob effects are banned (§3.2 slop filter)',
    severity: 'ERROR',
  },
  // Focus ring removal
  {
    pattern: /outline:\s*none|outline:\s*0(?!\s*;?\s*\/)(?!px)/g,
    message: 'outline:none removes focus rings — always replace with a visible :focus-visible ring (§17)',
    severity: 'ERROR',
  },
  // height:auto tween check (GSAP)
  {
    pattern: /gsap\.to\([^)]+height['"]\s*:\s*['"]auto/g,
    message: 'Never tween height:auto with GSAP (§12.3). Use grid-template-rows or GSAP Flip instead.',
    severity: 'ERROR',
  },
];

function getAllFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllFiles(full));
    } else if (entry.isFile() && (
      full.endsWith('.tsx') || full.endsWith('.ts') ||
      full.endsWith('.css') || full.endsWith('.mjs')
    )) {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(SRC);
let errors = [];
let warnings = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const content = readFileSync(file, 'utf-8');

  for (const rule of FORBIDDEN) {
    // Check if this file is allowed to use this pattern
    if (rule.allowedIn && rule.allowedIn.some(allowed => rel.includes(allowed))) {
      continue;
    }

    const matches = [...content.matchAll(rule.pattern)];
    for (const match of matches) {
      // Skip if the match is in a comment explaining the rule
      if (rule.except) {
        const lineStart = content.lastIndexOf('\n', match.index) + 1;
        const lineEnd = content.indexOf('\n', match.index);
        const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
        if (rule.except.test(line)) continue;
      }

      const entry = `${rule.severity} ${rel}: "${match[0]}" — ${rule.message}`;
      if (rule.severity === 'ERROR') {
        errors.push(entry);
      } else {
        warnings.push(entry);
      }
    }
  }
}

if (warnings.length) {
  console.warn('\n⚠ check-forbidden warnings:');
  warnings.forEach(w => console.warn(' ', w));
}

if (errors.length) {
  console.error('\n✗ check-forbidden FAILED:');
  errors.forEach(e => console.error(' ', e));
  process.exit(1);
} else {
  console.log('✓ check-forbidden passed — no banned patterns found');
}

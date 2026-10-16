#!/usr/bin/env node
/** Applies db/schema.sql to Neon. Usage: pnpm db:migrate  (DATABASE_URL comes from .env.local via --env-file). */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error('db-migrate: DATABASE_URL is not set (run `vercel env pull .env.local` first)');
  process.exit(1);
}
const sql = neon(url);
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'schema.sql');
const stmts = readFileSync(file, 'utf8')
  .replace(/^--.*$/gm, '')
  .split(/;\s*(?:\r?\n|$)/)
  .map((s) => s.trim())
  .filter(Boolean);
for (const s of stmts) await sql.query(s);
console.log(`db-migrate: applied ${stmts.length} statements`);

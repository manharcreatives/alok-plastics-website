#!/usr/bin/env node
/** One-off: copies the owner's existing data from the old PHP install (legacy-php/) into Neon.
 *  Business identity (GSTIN, bank, phones) comes from the ignored legacy config.php and lands in Neon only.
 *  Usage: pnpm db:seed   (nothing secret is printed) */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error('seed-legacy: DATABASE_URL is not set'); process.exit(1); }
const sql = neon(url);
const put = (key, value) => sql.query(
  'insert into kv (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value',
  [key, JSON.stringify(value)],
);

const cfg = join(ROOT, 'legacy-php', 'api', 'config.php');
if (existsSync(cfg)) {
  let json = '';
  try {
    json = execFileSync('php', ['-r', 'require $argv[1]; echo json_encode(["b" => $ALOK_BUSINESS ?? [], "wa" => $ALOK_WHATSAPP ?? "", "mail" => $ALOK_TO_EMAIL ?? ""]);', cfg], { encoding: 'utf8' });
  } catch { console.log('seed-legacy: php not available, business details skipped'); }
  if (json) {
    const { b, wa, mail } = JSON.parse(json);
    const business = {
      name: b.name ?? 'ALOK PLASTICS', gstin: b.gstin ?? '', tagline: b.tagline ?? [], address: b.address ?? [], phones: b.phones ?? [],
      state: b.state ?? 'Chandigarh', bank: b.bank ?? [], terms: b.terms ?? [], copies: b.copies ?? '', proforma_note: b.proforma_note ?? '',
      whatsapp: String(wa || ''), email: String(mail || ''),
    };
    await put('business', business);
    console.log('seed-legacy: business details saved');
  }
}

for (const name of ['settings', 'careers', 'product-overrides', 'products']) {
  const f = join(ROOT, 'legacy-php', 'data', `${name}.json`);
  if (!existsSync(f)) { console.log(`seed-legacy: ${name}.json not found, skipped`); continue; }
  await put(name, JSON.parse(readFileSync(f, 'utf8')));
  console.log(`seed-legacy: ${name} saved`);
}

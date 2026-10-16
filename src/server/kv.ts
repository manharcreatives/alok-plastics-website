import { query } from './db';

/** Site-wide JSON values (settings, careers, product overrides, business details) and counters. */
export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const r = (await query<{ value: T }>('select value from kv where key = $1', [key]))[0];
  return r ? r.value : null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await query('insert into kv (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value', [key, JSON.stringify(value)]);
}

/** Atomic counter. The first call for a key returns `start`, then start+1, ... */
export async function nextNumber(key: string, start = 1): Promise<number> {
  const r = (await query<{ n: number }>(
    `insert into kv (key, value) values ($1, jsonb_build_object('last', $2::int))
     on conflict (key) do update set value = jsonb_build_object('last', (kv.value->>'last')::int + 1)
     returning (value->>'last')::int as n`,
    [key, start],
  ))[0];
  return Number(r?.n ?? start);
}

export type Business = {
  name: string;
  gstin: string;
  tagline: string[];
  address: string[];
  phones: string[];
  state: string;
  bank: string[];
  terms: string[];
  copies: string;
  proforma_note: string;
  whatsapp: string;
  email: string;
};

const DEFAULT_BUSINESS: Business = {
  name: 'ALOK PLASTICS',
  gstin: '',
  tagline: [],
  address: [],
  phones: [],
  state: 'Chandigarh',
  bank: [],
  terms: [],
  copies: '',
  proforma_note: 'This is a proforma invoice, not a tax invoice. Final price, stock and delivery are confirmed by Alok Plastics.',
  whatsapp: process.env.NEXT_PUBLIC_CLIENT_WHATSAPP ?? '',
  email: '',
};

/** Business identity printed on invoices. Lives in Neon (kv "business"), never in the repository. */
export async function getBusiness(): Promise<Business> {
  const stored = await kvGet<Partial<Business>>('business');
  return { ...DEFAULT_BUSINESS, ...(stored ?? {}) };
}

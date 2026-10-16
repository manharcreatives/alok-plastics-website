import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

/** Neon over HTTP: one round trip per query, no connection pool to manage on serverless. */
function connection(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  client = neon(url);
  return client;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await connection().query(text, params)) as T[];
}

export const now = (): number => Math.floor(Date.now() / 1000);

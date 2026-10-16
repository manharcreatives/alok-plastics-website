import { query, now } from './db';

export type StoredFile = { id: string; kind: string; name: string; mime: string; size: number; data: Buffer };

/** Files live in Postgres (bytea). Resumes are capped at 3 MB and product photos are re-encoded small, so this stays light. */
export async function putFile(id: string, kind: string, name: string, mime: string, data: Buffer): Promise<void> {
  await query(
    `insert into files (id, kind, name, mime, size, data, created_at) values ($1,$2,$3,$4,$5, decode($6,'base64'), $7)
     on conflict (id) do update set name = excluded.name, mime = excluded.mime, size = excluded.size, data = excluded.data`,
    [id, kind, name, mime, data.length, data.toString('base64'), now()],
  );
}

export async function getFile(id: string, kind?: string): Promise<StoredFile | null> {
  const rows = await query<{ id: string; kind: string; name: string; mime: string; size: number; b64: string }>(
    `select id, kind, name, mime, size, encode(data, 'base64') as b64 from files where id = $1 ${kind ? 'and kind = $2' : ''}`,
    kind ? [id, kind] : [id],
  );
  const r = rows[0];
  return r ? { id: r.id, kind: r.kind, name: r.name, mime: r.mime, size: Number(r.size), data: Buffer.from(r.b64, 'base64') } : null;
}

export async function deleteFile(id: string): Promise<void> {
  await query('delete from files where id = $1', [id]);
}

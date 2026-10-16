import { audit, currentAdmin } from '@/server/admin-auth';
import { query } from '@/server/db';
import { parseFilter, whereOf } from '@/server/enquiries';

/* GET /admin/enquiries/export/ : the enquiries (with the list's filters, if any) as a CSV that opens in Excel. Admin session required. */

export const dynamic = 'force-dynamic';

const COLS = ['id', 'created_at', 'name', 'company', 'phone', 'email', 'city', 'state', 'gstin', 'buyer_type', 'product', 'quantity', 'unit', 'message', 'source', 'status', 'archived'] as const;

/** Quote every cell; prefix formula characters so a spreadsheet never runs submitted text as a formula. */
function cell(v: unknown): string {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const user = await currentAdmin();
  if (!user) return new Response('Sign in required', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const f = parseFilter(Object.fromEntries(new URL(req.url).searchParams));
  const { clause, args } = whereOf(f);
  const rows = await query<Record<string, unknown>>(`select ${COLS.join(', ')} from enquiries where ${clause} order by created_at desc, id desc`, args);
  const lines = [COLS.join(','), ...rows.map((r) => COLS.map((c) => (c === 'created_at' ? cell(new Date(Number(r[c]) * 1000).toISOString()) : cell(r[c]))).join(','))];
  await audit(user.username, 'enquiries_export', '', `${rows.length} rows`);
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

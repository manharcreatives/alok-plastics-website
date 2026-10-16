import { query } from './db';

export const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
export type Status = (typeof STATUSES)[number];

export type Enquiry = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstin: string;
  buyer_type: string;
  product: string;
  products: { name: string; qty: number; unit: string }[];
  quantity: number;
  unit: string;
  message: string;
  source: string;
  mail_ok: number;
  status: Status;
  notes: { by: string; at: number; text: string }[];
  assigned_to: string;
  seen: number;
  archived: number;
};

export const PAGE_SIZE = 25;

export const STATUS_LABELS: Record<string, string> = { new: 'New', contacted: 'Contacted', quoted: 'Quoted', won: 'Won', lost: 'Lost' };
export const BUYER_TYPES: Record<string, string> = { oem: 'OEM', dealer: 'Dealer', distributor: 'Distributor', 'repair-workshop': 'Repair workshop', other: 'Other' };

export type EnquiryFilter = {
  q: string; status: string; view: 'active' | 'archived' | 'all'; buyer: string; product: string; from: string; to: string;
  sort: 'date' | 'name' | 'company' | 'status' | 'product'; dir: 'asc' | 'desc'; page: number;
};

type Params = Record<string, string | string[] | undefined>;

/** Parse and clamp the list filters from the query string. */
export function parseFilter(sp: Params): EnquiryFilter {
  const s = (k: string, max = 80): string => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v ?? '').trim().slice(0, max);
  };
  const date = (v: string): string => (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : '');
  const view = s('view', 10);
  const sort = s('sort', 12);
  return {
    q: s('q', 100),
    status: (STATUSES as readonly string[]).includes(s('status', 12)) ? s('status', 12) : '',
    view: view === 'archived' || view === 'all' ? view : 'active',
    buyer: s('buyer', 20) in BUYER_TYPES ? s('buyer', 20) : '',
    product: s('product', 120),
    from: date(s('from', 10)),
    to: date(s('to', 10)),
    sort: (['date', 'name', 'company', 'status', 'product'] as const).find((k) => k === sort) ?? 'date',
    dir: s('dir', 4) === 'asc' ? 'asc' : 'desc',
    page: Math.max(1, Number.parseInt(s('page', 6), 10) || 1),
  };
}

/** Query string for the list preserving filters (defaults left out). */
export function filterQs(f: EnquiryFilter, o: Partial<EnquiryFilter> = {}): string {
  const m = { ...f, ...o };
  const u = new URLSearchParams();
  for (const k of ['q', 'status', 'view', 'buyer', 'product', 'from', 'to', 'sort', 'dir', 'page'] as const) {
    const v = String(m[k] ?? '');
    if (v === '' || (k === 'view' && v === 'active') || (k === 'sort' && v === 'date') || (k === 'dir' && v === 'desc') || (k === 'page' && Number(v) <= 1)) continue;
    u.set(k, v);
  }
  return u.toString();
}

const like = (v: string): string => `%${v.replace(/[%_\\]/g, '\\$&')}%`;
const SORT_COL = { date: 'created_at', name: 'name', company: 'company', status: 'status', product: 'product' } as const;

export function whereOf(f: EnquiryFilter): { clause: string; args: unknown[] } {
  const where: string[] = [];
  const args: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    args.push(v);
    where.push(sql.replace('$$', `$${args.length}`));
  };
  if (f.view === 'active') where.push('archived = 0');
  if (f.view === 'archived') where.push('archived = 1');
  if (f.status) add('status = $$', f.status);
  if (f.buyer) add('buyer_type = $$', f.buyer);
  if (f.product) add('product ilike $$', like(f.product));
  if (f.from) add('created_at >= $$', Math.floor(Date.parse(`${f.from}T00:00:00+05:30`) / 1000));
  if (f.to) add('created_at <= $$', Math.floor(Date.parse(`${f.to}T23:59:59+05:30`) / 1000));
  if (f.q) {
    args.push(like(f.q));
    const n = args.length;
    where.push(
      `(name ilike $${n} or company ilike $${n} or phone ilike $${n} or email ilike $${n} or product ilike $${n} or city ilike $${n} or state ilike $${n} or message ilike $${n} or gstin ilike $${n} or notes::text ilike $${n})`,
    );
  }
  return { clause: where.length ? where.join(' and ') : 'true', args };
}

export async function listEnquiries(f: EnquiryFilter): Promise<{ rows: Enquiry[]; total: number; pages: number; page: number }> {
  const { clause, args } = whereOf(f);
  const total = Number((await query<{ n: string }>(`select count(*) as n from enquiries where ${clause}`, args))[0]?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const dir = f.dir === 'asc' ? 'asc' : 'desc';
  const rows = await query<Enquiry>(
    `select * from enquiries where ${clause} order by ${SORT_COL[f.sort]} ${dir}, id ${dir} limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}`,
    args,
  );
  return { rows, total, pages, page };
}

export async function productNames(): Promise<string[]> {
  const r = await query<{ product: string }>("select distinct product from enquiries where product <> '' order by product limit 200");
  return r.map((x) => x.product);
}

export type Stats = {
  active: number; new: number; unseen: number; week: number; month: number; total: number; archived: number; mail_failed: number;
  by_status: Record<string, number>; buyers: Record<string, number>; products: [string, number][]; series: { day: string; n: number }[];
};

const IST = 'Asia/Kolkata';

export async function enquiryStats(): Promise<Stats> {
  const [c] = await query<Record<string, string>>(
    `select count(*) as total,
            count(*) filter (where archived = 1) as archived,
            count(*) filter (where archived = 0) as active,
            count(*) filter (where archived = 0 and status = 'new') as fresh,
            count(*) filter (where archived = 0 and seen = 0) as unseen,
            count(*) filter (where archived = 0 and mail_ok = 0) as mail_failed,
            count(*) filter (where archived = 0 and created_at >= extract(epoch from date_trunc('week', now() at time zone '${IST}') at time zone '${IST}')) as week,
            count(*) filter (where archived = 0 and created_at >= extract(epoch from date_trunc('month', now() at time zone '${IST}') at time zone '${IST}')) as month
       from enquiries`,
  );
  const st = await query<{ k: string; n: string }>('select status as k, count(*) as n from enquiries where archived = 0 group by 1');
  const by_status: Record<string, number> = Object.fromEntries(STATUSES.map((k) => [k, 0]));
  for (const r of st) by_status[r.k] = Number(r.n);
  const bu = await query<{ k: string; n: string }>('select buyer_type as k, count(*) as n from enquiries where archived = 0 group by 1');
  const buyers: Record<string, number> = Object.fromEntries(Object.keys(BUYER_TYPES).map((k) => [k, 0]));
  for (const r of bu) buyers[r.k in BUYER_TYPES ? r.k : 'other'] += Number(r.n);
  const pr = await query<{ k: string; n: string }>(
    `select name as k, count(*) as n from (
        select distinct e.id, trim(p->>'name') as name
          from enquiries e, jsonb_array_elements(case when jsonb_typeof(e.products) = 'array' then e.products else '[]'::jsonb end) p
         where e.archived = 0 and trim(coalesce(p->>'name','')) <> '') x
      group by name order by count(*) desc, name limit 8`,
  );
  const sr = await query<{ d: string; n: string }>(
    `select to_char(g.d, 'YYYY-MM-DD') as d, count(e.id) as n
       from generate_series(((now() at time zone '${IST}')::date - 29)::timestamp, (now() at time zone '${IST}')::date::timestamp, interval '1 day') as g(d)
       left join enquiries e on e.archived = 0 and ((to_timestamp(e.created_at) at time zone '${IST}')::date = g.d::date)
      group by g.d order by g.d`,
  );
  return {
    active: Number(c.active), new: Number(c.fresh), unseen: Number(c.unseen), week: Number(c.week), month: Number(c.month),
    total: Number(c.total), archived: Number(c.archived), mail_failed: Number(c.mail_failed), by_status, buyers,
    products: pr.map((r) => [r.k, Number(r.n)]), series: sr.map((r) => ({ day: r.d, n: Number(r.n) })),
  };
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  if (!/^\d{1,12}$/.test(id)) return null;
  return (await query<Enquiry>('select * from enquiries where id = $1', [id]))[0] ?? null;
}

export const fmtDate = (unix: number | string): string =>
  new Date(Number(unix) * 1000).toLocaleString('en-IN', { timeZone: IST, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const fmtShort = (unix: number | string): string =>
  new Date(Number(unix) * 1000).toLocaleString('en-IN', { timeZone: IST, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

export const fmtLong = (unix: number | string): string =>
  new Date(Number(unix) * 1000).toLocaleString('en-IN', { timeZone: IST, weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

export const ago = (ts: number | string): string => {
  const d = Math.floor(Date.now() / 1000) - Number(ts);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  if (d < 86400 * 14) return `${Math.floor(d / 86400)} d ago`;
  return new Date(Number(ts) * 1000).toLocaleString('en-IN', { timeZone: IST, day: '2-digit', month: 'short', year: 'numeric' });
};

function phoneDigits(phone: string): string {
  const plus = phone.trim().startsWith('+');
  let d = phone.replace(/\D/g, '');
  if (plus) return d;
  if (d.startsWith('00')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) return `91${d}`;
  return d;
}

/** One-click tel / WhatsApp / mail links with a short greeting filled in. */
export function contactLinks(r: Enquiry): { tel: string; wa: string; mail: string } {
  const d = phoneDigits(r.phone);
  const prod = r.product && r.product.toLowerCase() !== 'not specified' ? r.product : 'your requirement';
  const greet = `Hello ${r.name || 'there'}, thank you for your enquiry to Alok Plastics regarding ${prod}.`;
  return {
    tel: d ? `tel:+${d}` : '',
    wa: d ? `https://wa.me/${d}?text=${encodeURIComponent(greet)}` : '',
    mail: r.email ? `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent('Your enquiry to Alok Plastics')}&body=${encodeURIComponent(`${greet}\n\n`)}` : '',
  };
}

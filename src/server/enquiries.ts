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

export type EnquiryFilter = { status?: string; q?: string; archived?: boolean; page?: number };

export async function listEnquiries(f: EnquiryFilter): Promise<{ rows: Enquiry[]; total: number }> {
  const where: string[] = ['archived = $1'];
  const args: unknown[] = [f.archived ? 1 : 0];
  if (f.status && (STATUSES as readonly string[]).includes(f.status)) {
    args.push(f.status);
    where.push(`status = $${args.length}`);
  }
  if (f.q) {
    args.push(`%${f.q.replace(/[%_\\]/g, '\\$&')}%`);
    const n = args.length;
    where.push(`(name ilike $${n} or company ilike $${n} or phone ilike $${n} or email ilike $${n} or product ilike $${n} or city ilike $${n})`);
  }
  const clause = where.join(' and ');
  const total = Number((await query<{ n: string }>(`select count(*) as n from enquiries where ${clause}`, args))[0]?.n ?? 0);
  const offset = Math.max(0, ((f.page ?? 1) - 1) * PAGE_SIZE);
  const rows = await query<Enquiry>(
    `select * from enquiries where ${clause} order by created_at desc, id desc limit ${PAGE_SIZE} offset ${offset}`,
    args,
  );
  return { rows, total };
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  if (!/^\d{1,12}$/.test(id)) return null;
  return (await query<Enquiry>('select * from enquiries where id = $1', [id]))[0] ?? null;
}

export const fmtDate = (unix: number | string): string =>
  new Date(Number(unix) * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

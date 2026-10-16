import { query, now } from './db';

/* Small JSON documents in Postgres, one logical collection per name. Mirrors the PHP AlokCollection API the
   admin was built on (all / find / where / insert / update / delete) so the ported logic stays recognisable. */

export type CollectionName = 'customers' | 'orders' | 'carts' | 'sessions' | 'applications';
export type Meta = { id: number; created_at: number; updated_at: number };
export type Doc<T> = T & Meta;

type Raw<T> = { id: string; data: T; created_at: string; updated_at: string };

const hydrate = <T>(r: Raw<T>): Doc<T> => ({ ...r.data, id: Number(r.id), created_at: Number(r.created_at), updated_at: Number(r.updated_at) });

export function collection<T extends object>(name: CollectionName) {
  return {
    async all(): Promise<Doc<T>[]> {
      return (await query<Raw<T>>('select id, data, created_at, updated_at from docs where collection = $1 order by id', [name])).map(hydrate);
    },
    async find(id: number): Promise<Doc<T> | null> {
      if (!Number.isInteger(id) || id < 1) return null;
      const r = (await query<Raw<T>>('select id, data, created_at, updated_at from docs where collection = $1 and id = $2', [name, id]))[0];
      return r ? hydrate(r) : null;
    },
    /** Rows whose top-level field equals value (compared as text). */
    async where(field: string, value: string | number): Promise<Doc<T>[]> {
      return (await query<Raw<T>>(
        'select id, data, created_at, updated_at from docs where collection = $1 and data->>$2 = $3 order by id',
        [name, field, String(value)],
      )).map(hydrate);
    },
    async insert(row: T): Promise<Doc<T>> {
      const t = now();
      const r = (await query<Raw<T>>(
        'insert into docs (collection, data, created_at, updated_at) values ($1, $2::jsonb, $3, $3) returning id, data, created_at, updated_at',
        [name, JSON.stringify(row), t],
      ))[0];
      return hydrate(r as Raw<T>);
    },
    /** Shallow-merge patch into the document. */
    async update(id: number, patch: Partial<T> & Record<string, unknown>): Promise<Doc<T> | null> {
      const r = (await query<Raw<T>>(
        'update docs set data = data || $3::jsonb, updated_at = $4 where collection = $1 and id = $2 returning id, data, created_at, updated_at',
        [name, id, JSON.stringify(patch), now()],
      ))[0];
      return r ? hydrate(r) : null;
    },
    async delete(id: number): Promise<boolean> {
      return (await query('delete from docs where collection = $1 and id = $2 returning id', [name, id])).length > 0;
    },
    async count(): Promise<number> {
      return Number((await query<{ n: string }>('select count(*) as n from docs where collection = $1', [name]))[0]?.n ?? 0);
    },
  };
}

/* ── Typed shapes ───────────────────────────────────────────────────────── */

export type Note = { at: number; by: string; text: string };

export type Customer = { phone: string; name: string; address?: string; verified?: number; last_login?: number; ip?: string };

export type OrderItem = { slug: string; name: string; variant: string; qty: number; unit: string; price: number | null };

export type PdfEntry = {
  type: 'proforma' | 'invoice';
  no: string;
  date: string;
  created_at: number;
  to: string;
  caption: string;
  payload: PdfPayload;
};

export type Order = {
  code: string;
  customer_id: number;
  name: string;
  phone: string;
  address: string;
  verified: number;
  items: OrderItem[];
  total: number | null;
  note: string;
  status: string;
  notes: Note[];
  history?: { at: number; by: string; from: string; to: string; back?: boolean }[];
  pdfs?: PdfEntry[];
  quote_amount?: number | null;
  quote_note?: string;
  quoted_at?: number;
  confirmed_at?: number;
  pay_amount?: number | null;
  pay_mode?: string;
  pay_ref?: string;
  paid_at?: number;
  transporter?: string;
  lr_no?: string;
  dispatched_at?: number;
  invoice_no?: string;
  invoiced_at?: number;
  closed_at?: number;
  cancel_reason?: string;
  ip?: string;
};

export type CartLine = { slug: string; name: string; sku: string; qty: number; price: number | null; availability: string };
export type Cart = { visitor: string; status: 'open' | 'submitted'; lines: CartLine[]; name: string; phone: string; customer_id: number; started_at?: number; ip?: string; order_code?: string };

export type Application = {
  name: string; phone: string; email: string; position: string;
  resume_link: string; resume_file: string; resume_drive?: string; resume_name: string; resume_size: number;
  message: string; status: string; notes: Note[]; ip?: string; mail_ok?: number;
};

export type Session = { customer_id: number; hash: string; expires: number; ip: string };

export type PdfPayload = {
  customer: { name: string; phone: string; address: string; state: string; gstin: string };
  mode: 'intra' | 'inter' | 'ut';
  rate: number;
  items: { name: string; hsn: string; qty: number; unit: string; price: number | null }[];
  note: string;
  transport: { transporter: string; gr_no: string; gr_dt: string };
  invoice_no?: string;
};

export const customers = () => collection<Customer>('customers');
export const orders = () => collection<Order>('orders');
export const carts = () => collection<Cart>('carts');
export const sessions = () => collection<Session>('sessions');
export const applications = () => collection<Application>('applications');

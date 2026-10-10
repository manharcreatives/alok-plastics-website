import { useSyncExternalStore } from 'react';

export const AUTH_ENDPOINT = '/api/auth.php';
export const ORDER_ENDPOINT = '/api/order.php';
export const CART_ENDPOINT = '/api/cart.php';
const VISITOR_KEY = 'alok:visitor:v1';
const SESSION_KEY = 'alok:session:v1';

export interface Session {
  token: string;
  name: string;
  phone: string;
}

export interface OrderPayloadItem {
  slug: string;
  name: string;
  qty: number;
  price: number | null;
}

export interface PlacedOrder {
  code: string;
  createdAt: number;
  total: number | null;
  waNumber: string;
  waText: string;
}

export interface OrderHistoryLine {
  name: string;
  variant: string;
  qty: number;
  unit: string;
}

export interface OrderHistoryItem {
  code: string;
  createdAt: number;
  updatedAt?: number;
  total: number | null;
  status: string;
  itemCount: number;
  name?: string;
  address?: string;
  note?: string;
  items?: OrderHistoryLine[];
  quoteAmount?: number | null;
  transporter?: string;
  lrNo?: string;
  invoiceNo?: string;
  cancelReason?: string;
}

export type ApiFailure =
  | { ok: false; kind: 'validation'; errors: Record<string, string>; message?: string }
  | { ok: false; kind: 'invalid'; message: string }
  | { ok: false; kind: 'cooldown'; message: string }
  | { ok: false; kind: 'rate-limited'; message: string }
  | { ok: false; kind: 'auth'; message: string }
  | { ok: false; kind: 'unavailable'; message: string };

export type ApiResult<T> = ({ ok: true } & T) | ApiFailure;

const UNAVAILABLE: ApiFailure = {
  ok: false,
  kind: 'unavailable',
  message: 'We could not reach the server. Please check your connection and try again.',
};

interface RawReply {
  ok?: boolean;
  error?: string;
  code?: string;
  errors?: Record<string, string>;
  [key: string]: unknown;
}

async function post(path: string, body: unknown, token?: string): Promise<{ status: number; json: RawReply } | null> {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 25_000) : null;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['X-Alok-Session'] = token;
    const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body), signal: ctrl?.signal });
    const json = (await res.json().catch(() => null)) as RawReply | null;
    if (!json || typeof json !== 'object') return null;
    return { status: res.status, json };
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function failure(status: number, json: RawReply): ApiFailure {
  const message = typeof json.error === 'string' && json.error ? json.error : 'Something went wrong. Please try again.';
  if (status === 422 && json.errors) return { ok: false, kind: 'validation', errors: json.errors };
  if (status === 401 && json.code === 'auth') return { ok: false, kind: 'auth', message };
  if (status === 401) return { ok: false, kind: 'invalid', message };
  if (status === 429 && json.code === 'cooldown') return { ok: false, kind: 'cooldown', message };
  if (status === 429) return { ok: false, kind: 'rate-limited', message };
  if (status === 422) return { ok: false, kind: 'invalid', message };
  return { ok: false, kind: 'unavailable', message };
}

export async function requestOtp(name: string, phone: string): Promise<ApiResult<{ devCode?: string; session?: Session }>> {
  const r = await post(AUTH_ENDPOINT, { action: 'request', name, phone });
  if (!r) return UNAVAILABLE;
  if (r.status === 200 && r.json.ok === true && r.json.skipped === true && typeof r.json.token === 'string') {
    const u = r.json.user as { name?: string; phone?: string } | undefined;
    if (u?.name && u.phone) return { ok: true, session: { token: r.json.token, name: u.name, phone: u.phone } };
  }
  if (r.status === 200 && r.json.ok === true) {
    return { ok: true, devCode: typeof r.json.devCode === 'string' ? r.json.devCode : undefined };
  }
  return failure(r.status, r.json);
}

export async function verifyOtp(name: string, phone: string, code: string): Promise<ApiResult<{ session: Session }>> {
  const r = await post(AUTH_ENDPOINT, { action: 'verify', name, phone, code });
  if (!r) return UNAVAILABLE;
  const user = r.json.user as { name?: string; phone?: string } | undefined;
  if (r.status === 200 && r.json.ok === true && typeof r.json.token === 'string' && user?.name && user.phone) {
    return { ok: true, session: { token: r.json.token, name: user.name, phone: user.phone } };
  }
  return failure(r.status, r.json);
}

export async function checkSession(token: string): Promise<'valid' | 'expired' | 'unknown'> {
  const r = await post(AUTH_ENDPOINT, { action: 'me' }, token);
  if (!r) return 'unknown';
  if (r.status === 200 && r.json.ok === true) return 'valid';
  return r.status === 401 ? 'expired' : 'unknown';
}

/** Random anonymous id that ties a browser's cart to one row in the admin "Live carts" page. */
export function getVisitorId(): string {
  try {
    const stored = window.localStorage.getItem(VISITOR_KEY);
    if (stored && /^[a-zA-Z0-9_-]{16,64}$/.test(stored)) return stored;
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return '';
  }
}

export interface CartSyncLine {
  slug: string;
  name: string;
  sku: string;
  qty: number;
  price: number | null;
  availability: string;
}

/** Best-effort: the cart never depends on this succeeding (static preview, offline, no PHP). */
export async function syncCart(items: CartSyncLine[], token?: string): Promise<void> {
  const visitor = getVisitorId();
  if (!visitor) return;
  await post(CART_ENDPOINT, { visitor, items }, token);
}

export async function placeOrder(token: string, items: OrderPayloadItem[], note: string, address: string): Promise<ApiResult<{ order: PlacedOrder }>> {
  const r = await post(ORDER_ENDPOINT, { items, note, address, visitor: getVisitorId() }, token);
  if (!r) return UNAVAILABLE;
  const order = r.json.order as { code?: string; createdAt?: number; total?: number | null } | undefined;
  const wa = r.json.wa as { number?: string; text?: string } | undefined;
  if (r.status === 200 && r.json.ok === true && order?.code) {
    return {
      ok: true,
      order: {
        code: order.code,
        createdAt: Number(order.createdAt) || 0,
        total: typeof order.total === 'number' ? order.total : null,
        waNumber: wa?.number ?? '',
        waText: wa?.text ?? '',
      },
    };
  }
  return failure(r.status, r.json);
}

let current: Session | null = null;
let loaded = false;
const listeners = new Set<() => void>();

interface StoredSession extends Session {
  expiresAt?: number;
}

function readStored(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<StoredSession> | null;
    if (j && typeof j.token === 'string' && /^[a-f0-9]{64}$/.test(j.token) && typeof j.name === 'string' && typeof j.phone === 'string') {
      if (typeof j.expiresAt === 'number' && j.expiresAt < Date.now()) {
        try { window.localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
        return null;
      }
      return { token: j.token, name: j.name, phone: j.phone };
    }
  } catch {
    return current;
  }
  return null;
}

function emit(): void {
  listeners.forEach(l => l());
}

function ensureLoaded(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  current = readStored();
  window.addEventListener('storage', e => {
    if (e.key !== SESSION_KEY && e.key !== null) return;
    current = readStored();
    emit();
  });
}

export function setSession(s: Session | null): void {
  current = s;
  try {
    if (s) {
      const stored: StoredSession = { ...s, expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    current = s;
  }
  emit();
}

export async function signOut(): Promise<void> {
  const s = current;
  setSession(null);
  if (s) await post(AUTH_ENDPOINT, { action: 'logout' }, s.token);
}

function subscribe(cb: () => void): () => void {
  ensureLoaded();
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

function snapshot(): Session | null {
  ensureLoaded();
  return current;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export async function fetchOrders(token: string): Promise<OrderHistoryItem[]> {
  const r = await post(ORDER_ENDPOINT, { action: 'list' }, token);
  if (!r || r.status !== 200 || !r.json.ok) return [];
  const orders = r.json.orders;
  return Array.isArray(orders) ? (orders as OrderHistoryItem[]) : [];
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  const ten = d.length > 10 ? d.slice(-10) : d;
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

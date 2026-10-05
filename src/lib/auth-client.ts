import { useSyncExternalStore } from 'react';

export const AUTH_ENDPOINT = '/api/auth.php';
export const ORDER_ENDPOINT = '/api/order.php';
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

export async function requestOtp(name: string, phone: string): Promise<ApiResult<{ devCode?: string }>> {
  const r = await post(AUTH_ENDPOINT, { action: 'request', name, phone });
  if (!r) return UNAVAILABLE;
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

export async function placeOrder(token: string, items: OrderPayloadItem[], note: string): Promise<ApiResult<{ order: PlacedOrder }>> {
  const r = await post(ORDER_ENDPOINT, { items, note }, token);
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

function readStored(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<Session> | null;
    if (j && typeof j.token === 'string' && /^[a-f0-9]{64}$/.test(j.token) && typeof j.name === 'string' && typeof j.phone === 'string') {
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
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
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

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  const ten = d.length > 10 ? d.slice(-10) : d;
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

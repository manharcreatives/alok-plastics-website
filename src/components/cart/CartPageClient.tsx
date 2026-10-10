'use client';

/**
 * /cart body. Lines, blocking rules, honest totals, customer details and the WhatsApp
 * order request. The cart is never cleared automatically after sending.
 */

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { WhatsappLogo } from '@phosphor-icons/react/dist/csr/WhatsappLogo';
import { Copy } from '@phosphor-icons/react/dist/csr/Copy';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { flattenZodErrors, messageField, nameField, phoneField } from '@/lib/enquiry-schema';
import { orderMessage, waLink, waOrder, type OrderCustomer, type OrderLine } from '@/lib/whatsapp';
import { checkSession, fetchOrders, maskPhone, placeOrder, setSession, signOut, useSession, type OrderHistoryItem, type PlacedOrder } from '@/lib/auth-client';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';
import { trackCartOpen, trackOrderRequestWhatsApp } from '@/lib/analytics';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import { formatPrice } from './cart-catalog';
import CartAuth from './CartAuth';
import CartLineRow from './CartLineRow';
import { useCart, useCartLines } from './useCart';
import './cart.css';

const DETAILS_KEY = 'alok:cart:customer:v1';

const customerSchema = z.object({
  name: nameField,
  phone: phoneField,
  address: z.string().trim().min(3, 'Enter your delivery address or city.').max(300, 'Address must be under 300 characters.'),
  message: messageField,
});

const FIELD_ORDER = ['name', 'phone', 'address', 'message'] as const;

function loadDetails(): { name: string; phone: string; address: string; remember: boolean } {
  try {
    const raw = window.localStorage.getItem(DETAILS_KEY);
    const d = raw ? JSON.parse(raw) : null;
    if (d && typeof d === 'object') {
      return {
        name: typeof d.name === 'string' ? d.name : '',
        phone: typeof d.phone === 'string' ? d.phone : '',
        address: typeof d.address === 'string' ? d.address : '',
        remember: true,
      };
    }
  } catch { /* unreadable or blocked: start blank */ }
  return { name: '', phone: '', address: '', remember: false };
}

function saveDetails(d: OrderCustomer, remember: boolean): void {
  try {
    if (remember) window.localStorage.setItem(DETAILS_KEY, JSON.stringify({ name: d.name, phone: d.phone, address: d.address }));
    else window.localStorage.removeItem(DETAILS_KEY);
  } catch { /* ignore */ }
}

const noopSubscribe = () => () => {};

export default function CartPageClient() {
  /* false on the server and the first client render, so the stored cart never mismatches. */
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <section className="cp" aria-labelledby="cart-h1">
      <div className="cp__wrap">
        <h1 id="cart-h1" className="cp__h1">Your cart</h1>
        {hydrated ? <CartBody /> : <p role="status" style={{ color: 'var(--muted)' }}>Loading your cart&hellip;</p>}
      </div>
    </section>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Received', reviewing: 'Under review', quoted: 'Quote sent', confirmed: 'Confirmed',
  paid: 'Payment received', dispatched: 'Dispatched', invoiced: 'Invoiced', delivered: 'Delivered', closed: 'Closed', cancelled: 'Cancelled',
};
/* The order's journey, in order. A cancelled order shows its own state instead. */
const STATUS_FLOW = ['pending', 'reviewing', 'quoted', 'confirmed', 'paid', 'dispatched', 'invoiced', 'closed'];
const STATUS_TONE: Record<string, string> = {
  pending: 'new', reviewing: 'new', quoted: 'wait', confirmed: 'ok', paid: 'ok', dispatched: 'ok', invoiced: 'ok', delivered: 'ok', closed: 'done', cancelled: 'bad',
};

const fmtDate = (t: number) => new Date(t * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (t: number) => new Date(t * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

function OrderHistoryPanel({ signedIn, orders, name }: { signedIn: boolean; orders: OrderHistoryItem[] | null; name: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="oh" aria-label="Order history">
      <h3 className="cp__h3">Your order history{name ? ` · ${name}` : ''}</h3>
      {!signedIn ? (
        <p className="cp__note">Sign in with your mobile number (the form on this page) to see your past orders.</p>
      ) : orders === null ? (
        <p className="cp__note">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <p className="cp__note">No orders yet. Your enquiries will show up here once you submit one.</p>
      ) : (
        <>
          <p className="oh-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
          <div className="oh-scroll">
            <table className="oh-table">
              <caption className="sr-only">Your orders with Alok Plastics</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Date</th>
                  <th scope="col">Ordered by</th>
                  <th scope="col">What you ordered</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const items = o.items ?? [];
                  const isOpen = open === o.code;
                  const first = items[0];
                  const more = items.length - 1;
                  const flowIdx = STATUS_FLOW.indexOf(o.status === 'delivered' ? 'closed' : o.status);
                  return (
                    <Fragment key={o.code}>
                      <tr className={`oh-row${isOpen ? ' is-open' : ''}`}>
                        <td data-label="Order" className="oh-code">{o.code}</td>
                        <td data-label="Date"><span className="oh-val">{fmtDate(o.createdAt)}<span className="oh-sub">{fmtTime(o.createdAt)}</span></span></td>
                        <td data-label="Ordered by">{o.name || name || '-'}</td>
                        <td data-label="What you ordered">
                          <span className="oh-val">
                            {first ? <>{first.name} <span className="oh-qty">× {first.qty}</span>{more > 0 && <span className="oh-more"> +{more} more</span>}</> : <>{o.itemCount} {o.itemCount === 1 ? 'product' : 'products'}</>}
                          </span>
                        </td>
                        <td data-label="Status"><span className={`oh-badge oh-badge--${STATUS_TONE[o.status] ?? 'new'}`}>{STATUS_LABEL[o.status] ?? o.status}</span></td>
                        <td className="oh-act">
                          <button type="button" className="oh-btn" aria-expanded={isOpen} aria-controls={`oh-d-${o.code}`} onClick={() => setOpen(isOpen ? null : o.code)}>
                            {isOpen ? 'Hide' : 'Details'} <CaretDown size={14} weight="bold" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="oh-detail" id={`oh-d-${o.code}`}>
                          <td colSpan={6}>
                            <div className="oh-grid">
                              <div>
                                <h4 className="oh-h4">Items</h4>
                                <table className="oh-items">
                                  <thead><tr><th scope="col">Product</th><th scope="col">Qty</th></tr></thead>
                                  <tbody>
                                    {items.map((it, i) => (
                                      <tr key={i}><td>{it.name}{it.variant ? <span className="oh-sub">{it.variant}</span> : null}</td><td>{it.qty} {it.unit}</td></tr>
                                    ))}
                                  </tbody>
                                </table>
                                {o.total !== null && o.total !== undefined && <p className="oh-fact">Estimated total: {formatPrice(o.total)}</p>}
                                {o.quoteAmount ? <p className="oh-fact">Quote: {formatPrice(o.quoteAmount)}</p> : null}
                              </div>
                              <div>
                                <h4 className="oh-h4">Delivery</h4>
                                <p className="oh-text">{o.address || 'No address saved'}</p>
                                {o.note ? <><h4 className="oh-h4">Your note</h4><p className="oh-text">{o.note}</p></> : null}
                                {(o.transporter || o.lrNo) ? <p className="oh-fact">Dispatch: {[o.transporter, o.lrNo ? `LR ${o.lrNo}` : ''].filter(Boolean).join(' · ')}</p> : null}
                                {o.invoiceNo ? <p className="oh-fact">Invoice: {o.invoiceNo}</p> : null}
                              </div>
                              <div>
                                <h4 className="oh-h4">Progress</h4>
                                {o.status === 'cancelled' ? (
                                  <p className="oh-text">Cancelled{o.cancelReason ? `: ${o.cancelReason}` : ''}</p>
                                ) : (
                                  <ol className="oh-steps">
                                    {STATUS_FLOW.map((st, i) => (
                                      <li key={st} className={i <= flowIdx ? 'is-done' : undefined} aria-current={i === flowIdx ? 'step' : undefined}>{STATUS_LABEL[st]}</li>
                                    ))}
                                  </ol>
                                )}
                                {o.updatedAt ? <p className="oh-fact">Last update: {fmtDate(o.updatedAt)}, {fmtTime(o.updatedAt)}</p> : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function CartBody() {
  const cart = useCart();
  const lines = useCartLines();
  const { whatsapp } = useRuntimeContact();
  const formRef = useRef<HTMLFormElement>(null);
  const [initial] = useState(loadDetails);
  const [remember, setRemember] = useState(initial.remember);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const session = useSession();
  const [legacy, setLegacy] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [address, setAddress] = useState(initial.address);
  const [orderNote, setOrderNote] = useState('');
  const [placed, setPlaced] = useState<{ order: PlacedOrder; href: string | null; items: { name: string; qty: number }[]; name: string } | null>(null);
  const token = session?.token ?? null;
  useEffect(() => {
    if (!token) return;
    let live = true;
    checkSession(token).then(r => { if (live && r === 'expired') setSession(null); });
    return () => { live = false; };
  }, [token]);
  useEffect(() => {
    if (!token) { setOrderHistory(null); return; }
    let live = true;
    fetchOrders(token).then(orders => { if (live) setOrderHistory(orders); });
    return () => { live = false; };
  }, [token]);
  useEffect(() => { trackCartOpen({ source: 'page', lineCount: lines.length }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (placed) {
    return (
      <div className="cp__done" role="status" aria-live="polite">
        <span className="cp__done-mark"><CheckCircle weight="light" size={32} aria-hidden="true" /></span>
        <h2>Thank you, {placed.name.split(' ')[0]}. Your enquiry is submitted.</h2>
        <div className="cp__done-id"><span>Enquiry ID</span><strong>{placed.order.code}</strong></div>
        <p>
          {placed.href
            ? 'We have opened WhatsApp with your enquiry summary. Press Send so our team can review it and share the quote / proforma invoice.'
            : 'Our team will contact you on your registered mobile number to confirm availability, price and delivery.'}
        </p>
        <ul className="cp__done-list">
          {placed.items.map((it, i) => <li key={i}><span>{it.name}</span><span>&times; {it.qty}</span></li>)}
        </ul>
        <div className="cp__done-actions">
          {placed.href && (
            <a className="cbtn cbtn--wa" href={placed.href} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo weight="fill" size={22} aria-hidden="true" />
              Send enquiry on WhatsApp
            </a>
          )}
          <Link href="/products/" className="cbtn cbtn--ghost">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="cp__empty">
        <p>Your cart is empty.</p>
        <Link href="/products/" className="cbtn">Browse products</Link>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <button type="button" className="clink" onClick={() => setShowHistory(v => !v)} aria-expanded={showHistory}>Order history</button>
        </p>
        {showHistory && <OrderHistoryPanel signedIn={!!token} orders={orderHistory} name={session?.name ?? ''} />}
      </div>
    );
  }

  const blocked = lines.some(l => l.unavailable || l.outOfStock || l.overStock);
  const allPriced = lines.every(l => l.price !== null);
  const total = allPriced ? lines.reduce((s, l) => s + (l.price as number) * l.qty, 0) : null;
  const units = lines.reduce((n, l) => n + l.qty, 0);

  const readCustomer = (): { customer?: OrderCustomer; errs: Record<string, string> } => {
    const fd = new FormData(formRef.current ?? undefined);
    const parsed = customerSchema.safeParse({
      name: fd.get('name') ?? '', phone: fd.get('phone') ?? '', address: fd.get('address') ?? '', message: fd.get('message') ?? '',
    });
    if (!parsed.success) return { errs: flattenZodErrors(parsed.error) };
    const d = parsed.data;
    return { customer: { name: d.name, phone: d.phone, address: d.address, message: d.message || undefined }, errs: {} };
  };

  const orderLines = (): OrderLine[] => lines.map(l => ({
    name: l.product?.name ?? l.slug, sku: l.product?.sku ?? null, qty: l.qty, price: l.price,
  }));

  const validate = (): OrderCustomer | null => {
    const { customer, errs } = readCustomer();
    setErrors(errs);
    if (!customer) {
      const first = FIELD_ORDER.find(k => errs[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#cf-${first}`)?.focus();
      return null;
    }
    return customer;
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    const customer = validate();
    if (!customer) return;
    const message = orderMessage(orderLines(), customer);
    const href = waOrder(orderLines(), customer, whatsapp);
    saveDetails(customer, remember);
    setSent(message);
    setCopied(false);
    setCopyFailed(false);
    trackOrderRequestWhatsApp({ lineCount: lines.length, unitCount: units });
    if (href) window.open(href, '_blank', 'noopener');
  };

  const onCopy = async () => {
    let message = sent;
    if (!message) {
      const customer = validate();
      if (!customer) return;
      message = orderMessage(orderLines(), customer);
      saveDetails(customer, remember);
      setSent(message);
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  const onPlace = async (e: FormEvent) => {
    e.preventDefault();
    if (blocked || placing || !session) return;
    if (address.trim().length < 8) {
      setOrderError('Enter your full delivery address (house / street, city, pincode).');
      document.getElementById('cf-address')?.focus();
      return;
    }
    /* Opened now, inside the click, so the browser's popup blocker allows it; sent to WhatsApp once the order is saved.
       Do not null `popup.opener`: that makes the tab cross-origin and the later navigation throws a SecurityError. */
    const popup = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    setPlacing(true);
    setOrderError('');
    const res = await placeOrder(
      session.token,
      lines.map(l => ({ slug: l.slug, name: l.product?.name ?? l.slug, qty: l.qty, price: l.price })),
      orderNote.trim(),
      address.trim(),
    );
    setPlacing(false);
    if (!res.ok) {
      popup?.close();
      if (res.kind === 'auth') setSession(null);
      setOrderError(res.kind === 'validation' ? 'Please check your cart and try again.' : res.message);
      return;
    }
    const href = res.order.waText ? waLink(res.order.waText, res.order.waNumber || whatsapp) : null;
    /* If the tab cannot be navigated (blocked, or closed by the visitor), close it quietly: the success screen
       below still has the "Send enquiry on WhatsApp" button for the same link. */
    if (popup && href) {
      try { popup.location.href = href; } catch { popup.close(); }
    } else {
      popup?.close();
    }
    trackOrderRequestWhatsApp({ lineCount: lines.length, unitCount: units });
    setPlaced({ order: res.order, href, name: session.name, items: lines.map(l => ({ name: l.product?.name ?? l.slug, qty: l.qty })) });
    cart.clear();
  };

  const err = (k: string) => errors[k];
  const field = (k: (typeof FIELD_ORDER)[number]) => ({
    id: `cf-${k}`,
    name: k,
    'aria-invalid': err(k) ? (true as const) : undefined,
    'aria-describedby': err(k) ? `cf-${k}-err` : undefined,
  });

  return (
    <div className="cp__grid">
      <div className="cp__panel">
        <h2 className="cp__h2">{lines.length} {lines.length === 1 ? 'product' : 'products'} &middot; {units} {units === 1 ? 'unit' : 'units'}</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {lines.map(l => <CartLineRow key={l.slug} line={l} />)}
        </ul>

        <div className="cp__total">
          {total !== null && !blocked ? (
            <><span>Estimated total</span><span>{formatPrice(total)}</span></>
          ) : (
            <span>Final price confirmed by Alok Plastics</span>
          )}
        </div>

        <div className="cp__tools">
          <Link href="/products/" className="clink">Continue shopping</Link>
          {confirmClear ? (
            <span role="alertdialog" aria-label="Confirm clear cart" style={{ display: 'inline-flex', gap: 'var(--space-xs)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem' }}>Remove everything from your cart?</span>
              <button type="button" className="cbtn cbtn--sm" onClick={() => { cart.clear(); setConfirmClear(false); setSent(null); }}>Yes, clear cart</button>
              <button type="button" className="cbtn cbtn--sm cbtn--ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
            </span>
          ) : (
            <button type="button" className="clink clink--muted" onClick={() => setConfirmClear(true)}>Clear cart</button>
          )}
          <button type="button" className="clink cp__histbtn" onClick={() => setShowHistory(v => !v)} aria-expanded={showHistory}>
            <ClockCounterClockwise size={18} weight="light" aria-hidden="true" /> Order history
          </button>
        </div>
        {showHistory && <OrderHistoryPanel signedIn={!!token} orders={orderHistory} name={session?.name ?? ''} />}
      </div>

      <aside className="cp__aside cp__panel" aria-label="Your details">
        {legacy ? (
          <>
              <h2 className="cp__h2">Your details</h2>
              <form ref={formRef} className="cf" onSubmit={onSend} noValidate>
                <div className="cf__field">
                  <label htmlFor="cf-name">Full name *</label>
                  <input {...field('name')} type="text" autoComplete="name" defaultValue={initial.name} aria-required="true" />
                  {err('name') && <p id="cf-name-err" className="cf__err" role="alert">{err('name')}</p>}
                </div>
                <div className="cf__field">
                  <label htmlFor="cf-phone">Phone *</label>
                  <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" defaultValue={initial.phone} aria-required="true" />
                  {err('phone') && <p id="cf-phone-err" className="cf__err" role="alert">{err('phone')}</p>}
                </div>
                <div className="cf__field">
                  <label htmlFor="cf-address">Delivery address / city *</label>
                  <textarea {...field('address')} rows={3} autoComplete="street-address" defaultValue={initial.address} aria-required="true" />
                  {err('address') && <p id="cf-address-err" className="cf__err" role="alert">{err('address')}</p>}
                </div>
                <div className="cf__field">
                  <label htmlFor="cf-message">Message <span className="cf__opt">(optional)</span></label>
                  <textarea {...field('message')} rows={3} />
                  {err('message') && <p id="cf-message-err" className="cf__err" role="alert">{err('message')}</p>}
                </div>
                <label className="cf__remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Remember my details on this device
                </label>

                {blocked && (
                  <p className="cf__blocked" role="alert">
                    Fix the items marked above before sending: remove unavailable products or lower the quantity.
                  </p>
                )}

                {whatsapp ? (
                  <button type="submit" className="cbtn cbtn--wa cbtn--block" disabled={blocked}>
                    <WhatsappLogo weight="fill" size={22} aria-hidden="true" />
                    Send order request on WhatsApp
                  </button>
                ) : (
                  <div>
                    <p className="cf__blocked" style={{ color: 'var(--body)' }}>
                      WhatsApp ordering is not set up yet. Copy your request and send it through the enquiry form instead.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                      <button type="button" className="cbtn cbtn--sm" onClick={onCopy} disabled={blocked}>
                        <Copy weight="light" size={18} aria-hidden="true" /> Copy order message
                      </button>
                      <Link href="/enquiry/" className="cbtn cbtn--sm cbtn--ghost">Go to enquiry form</Link>
                    </div>
                  </div>
                )}
              </form>

              <p className="cp__note">
                This is an order request, not a confirmed order. Price, stock, delivery and payment are confirmed by Alok Plastics on WhatsApp. No payment is taken on this site.
              </p>

              {sent && (
                <div className="cp__sent" role="status" aria-live="polite">
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>
                    {whatsapp
                      ? 'Request opened in WhatsApp. If it did not open, copy the message.'
                      : 'Your order message is ready. Copy it and send it to us.'}
                  </p>
                  <label htmlFor="cf-copy" className="sr-only">Order message</label>
                  <textarea id="cf-copy" readOnly value={sent} onFocus={e => e.currentTarget.select()} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', alignItems: 'center' }}>
                    <button type="button" className="cbtn cbtn--sm" onClick={onCopy}>
                      <Copy weight="light" size={18} aria-hidden="true" /> Copy message
                    </button>
                    <button type="button" className="clink clink--muted" onClick={() => { cart.clear(); setSent(null); }}>Clear cart</button>
                  </div>
                  {copied && <p style={{ margin: 'var(--space-xs) 0 0', fontSize: '0.875rem', color: 'var(--success)' }}>Copied.</p>}
                  {copyFailed && <p style={{ margin: 'var(--space-xs) 0 0', fontSize: '0.875rem', color: 'var(--error)' }}>Could not copy automatically. Select the text above and copy it.</p>}
                </div>
              )}
          </>
        ) : session ? (
          <>
            <h2 className="cp__h2">Submit your enquiry</h2>
            <div className="cp__who">
              <div>
                <p className="cp__who-name">{session.name}</p>
                <p className="cp__who-phone">{maskPhone(session.phone)}</p>
              </div>
              <button type="button" className="clink clink--muted" onClick={() => void signOut()}>Sign out</button>
            </div>
            <form className="cf" onSubmit={onPlace} noValidate>
              <div className="cf__field">
                <label htmlFor="cf-address">Delivery address *</label>
                <textarea id="cf-address" rows={3} autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} maxLength={300} required aria-required="true" placeholder="House / street, city, state, pincode" />
              </div>
              <div className="cf__field">
                <label htmlFor="cf-note">Message <span className="cf__opt">(optional)</span></label>
                <textarea id="cf-note" rows={2} value={orderNote} onChange={e => setOrderNote(e.target.value)} maxLength={600} />
              </div>
              {blocked && (
                <p className="cf__blocked" role="alert">
                  Fix the items marked above before submitting your enquiry: remove unavailable products or lower the quantity.
                </p>
              )}
              {orderError && <p className="cf__blocked" role="alert">{orderError}</p>}
              <button type="submit" className="cbtn cbtn--block" disabled={blocked || placing}>
                {placing ? 'Submitting…' : 'Submit enquiry'}
              </button>
            </form>
            <p className="cp__note">
              Your enquiry is saved with us and a WhatsApp message is prepared for you. Price, stock, delivery and payment are confirmed by Alok Plastics. No payment is taken on this site.
            </p>
          </>
        ) : (
          <>
            <h2 className="cp__h2">Sign in to order</h2>
            <CartAuth onUnavailable={() => setLegacy(true)} />
            <p className="cp__note">We use your mobile number only to confirm your order and contact you about it.</p>
          </>
        )}
      </aside>
    </div>
  );
}

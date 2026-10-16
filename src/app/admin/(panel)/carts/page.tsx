import Link from 'next/link';
import AutoRefresh from '@/components/admin/AutoRefresh';
import { Badge } from '@/components/admin/ui';
import { rupees } from '@/server/admin-util';
import { carts, type Cart, type Doc } from '@/server/collection';
import { now } from '@/server/db';
import { fmtDateTime } from '@/server/shop';

const AVAIL: Record<string, string> = { 'in-stock': 'In stock', 'out-of-stock': 'Out of stock', 'on-request': 'On request' };

function ago(ts: number): string {
  const d = Math.max(0, now() - ts);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)} min ago`;
  if (d < 86400) return `${Math.floor(d / 3600)} h ago`;
  return `${Math.floor(d / 86400)} d ago`;
}
const units = (c: Cart): number => c.lines.reduce((s, l) => s + l.qty, 0);

export default async function CartsPage() {
  const all = await carts().all();
  const open: Doc<Cart>[] = all.filter((c) => c.status === 'open').sort((a, b) => b.updated_at - a.updated_at);
  const done = all.filter((c) => c.status === 'submitted').sort((a, b) => b.updated_at - a.updated_at).slice(0, 10);
  return (
    <>
      <AutoRefresh seconds={8} />
      <h1>Live carts</h1>
      <p className="sub">What visitors have in their cart right now. Refreshes every few seconds. {open.length} open.</p>
      {open.length === 0 ? <section className="adm-card"><p className="adm-empty">No open carts. They appear the moment a visitor adds a product.</p></section> : null}
      {open.map((c) => {
        const known = c.name !== '';
        const wa = c.phone ? `https://wa.me/${c.phone}?text=${encodeURIComponent(`Hello ${c.name}, this is Alok Plastics. We noticed items in your cart. Can we help you with a quote?`)}` : '';
        return (
          <section className="adm-card" key={c.id}>
            <h2>{known ? <>{c.name} <small>+{c.phone}</small></> : 'Visitor (not signed in yet)'}</h2>
            <p className="sub" style={{ margin: '0 0 10px' }}>{c.lines.length} product{c.lines.length === 1 ? '' : 's'} &middot; {units(c)} units &middot; updated {ago(c.updated_at)}</p>
            <div className="adm-tablewrap">
              <table>
                <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Availability</th></tr></thead>
                <tbody>
                  {c.lines.map((l, i) => (
                    <tr key={i}>
                      <td>{l.name}{l.sku ? <><br /><small>{l.sku}</small></> : null}</td>
                      <td>{l.qty.toLocaleString('en-IN')}</td>
                      <td>{l.price === null ? 'On request' : rupees(l.price)}</td>
                      <td>{AVAIL[l.availability] ?? 'On request'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p><small>Started {fmtDateTime(c.started_at ?? c.created_at)}</small></p>
            {wa ? <p><a className="adm-btn" href={wa} target="_blank" rel="noreferrer">WhatsApp follow-up</a></p> : null}
          </section>
        );
      })}
      {done.length > 0 ? (
        <section className="adm-card">
          <h2>Recently turned into orders</h2>
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>Customer</th><th>Products</th><th>Order</th></tr></thead>
              <tbody>
                {done.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name || 'Visitor'}{c.phone ? <><br /><small>+{c.phone}</small></> : null}</td>
                    <td>{c.lines.length} &middot; {units(c)} units</td>
                    <td>{c.order_code ? <Link href={`/admin/orders/?q=${c.order_code}`}>{c.order_code}</Link> : <Badge s="closed" label="submitted" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}

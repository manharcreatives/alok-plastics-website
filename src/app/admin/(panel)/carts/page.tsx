import AutoRefresh from '@/components/admin/AutoRefresh';
import { EmptyState, Icon, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { carts, type Cart, type Doc } from '@/server/collection';
import { now } from '@/server/db';
import { fmtDateTime } from '@/server/shop';

export const metadata = { title: 'Live carts' };

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
  await requireAdmin();
  const all = await carts().all();
  const open: Doc<Cart>[] = all.filter((c) => c.status === 'open').sort((a, b) => b.updated_at - a.updated_at);
  const done = all.filter((c) => c.status === 'submitted').sort((a, b) => b.updated_at - a.updated_at).slice(0, 10);
  return (
    <>
      <AutoRefresh seconds={8} />
      <PageHead
        title="Live carts"
        crumbs={[['Dashboard', '/admin/'], ['Live carts', null]]}
        lead="What visitors have in their cart right now. This page refreshes itself every few seconds."
        extra={<> <span className="meta">{open.length} open</span></>}
      />

      {open.length === 0 ? (
        <EmptyState icon="cart" title="No open carts"><p>Carts appear here the moment a visitor adds a product on the website.</p></EmptyState>
      ) : null}

      {open.map((c) => {
        const stale = c.updated_at < now() - 86400;
        const known = c.name !== '';
        const wa = c.phone ? `https://wa.me/${c.phone}?text=${encodeURIComponent(`Hello ${c.name}, this is Alok Plastics. We noticed items in your cart. Can we help you with a quote?`)}` : '';
        return (
          <section className="card" key={c.id} aria-label={`Cart of ${known ? c.name : 'a visitor'}`}>
            <div className="card-head">
              <h2 className="card-title">{known ? <>{c.name} <span className="meta">+{c.phone}</span></> : 'Visitor not signed in yet'}</h2>
              <span className="card-sub">{c.lines.length} {c.lines.length === 1 ? 'product' : 'products'} · {units(c)} units · updated {ago(c.updated_at)}{stale ? <> · <span className="badge tone-muted">Abandoned</span></> : null}</span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Availability</th></tr></thead>
                <tbody>
                  {c.lines.map((l, i) => (
                    <tr key={i}>
                      <td><span className="cell-main">{l.name}</span>{l.sku ? <span className="cell-sub">{l.sku}</span> : null}</td>
                      <td className="nowrap">{l.qty.toLocaleString('en-IN')}</td>
                      <td className="nowrap">{l.price !== null ? `Rs. ${Math.round(l.price).toLocaleString('en-IN')}` : 'On request'}</td>
                      <td className="nowrap">{AVAIL[l.availability] ?? 'On request'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="meta">Started {fmtDateTime(c.started_at ?? c.created_at)}{known ? '' : ' · the customer will appear here once they enter their name and mobile number'}</p>
            {wa ? <p><a className="btn btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="chat" />WhatsApp follow-up</a></p> : null}
          </section>
        );
      })}

      {done.length > 0 ? (
        <section className="card" aria-labelledby="h-done">
          <div className="card-head"><h2 className="card-title" id="h-done">Recently turned into enquiries</h2></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th scope="col">Customer</th><th scope="col">Products</th><th scope="col">Enquiry</th></tr></thead>
              <tbody>
                {done.map((c) => (
                  <tr key={c.id}>
                    <td><span className="cell-main">{c.name || 'Visitor'}</span><span className="cell-sub">{c.phone ? `+${c.phone}` : ''}</span></td>
                    <td>{c.lines.length} · {units(c)} units</td>
                    <td className="nowrap">{c.order_code ?? ''}</td>
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

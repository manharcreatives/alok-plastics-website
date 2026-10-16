import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/admin-auth';
import { getOrder } from '@/server/orders-admin';
import { Icon, PageHead } from '@/components/admin/ui';
import { deleteOrder } from '../actions';

export const metadata = { title: 'Delete order' };

export default async function DeleteOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const o = await getOrder(id);
  if (!o) notFound();
  return (
    <>
      <PageHead title={`Delete ${o.code}?`} crumbs={[['Dashboard', '/admin/'], ['Orders', '/admin/orders/'], [o.code, `/admin/orders/${id}/`], ['Delete', null]]} />
      <section className="card narrow">
        <span className="empty-ico"><Icon name="trash" /></span>
        <p>This permanently removes <b>{o.code}</b> from <b>{o.name}</b>, with its notes and PDF records. It cannot be undone.</p>
        <p className="meta">If you only want to close it, cancel the order instead so a record stays.</p>
        <form action={deleteOrder.bind(null, id)} className="actions">
          <button className="btn btn-danger" type="submit">Yes, delete permanently</button>
          <Link className="btn btn-secondary" href={`/admin/orders/${id}/`}>Keep it</Link>
        </form>
      </section>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/server/admin-auth';
import { getEnquiry } from '@/server/enquiries';
import { Icon, PageHead } from '@/components/admin/ui';
import { deleteEnquiry } from '../actions';

export const metadata = { title: 'Delete enquiry' };

export default async function DeleteEnquiry({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await getEnquiry(id);
  if (!r) notFound();
  return (
    <>
      <PageHead title={`Delete enquiry #${r.id}?`} crumbs={[['Dashboard', '/admin/'], ['Enquiries', '/admin/enquiries/'], [`#${r.id}`, `/admin/enquiries/${r.id}/`], ['Delete', null]]} />
      <section className="card narrow">
        <span className="empty-ico"><Icon name="trash" /></span>
        <p>This permanently removes the enquiry from <b>{r.name}</b> ({r.company}) including its notes. It cannot be undone.</p>
        <p className="meta">If you only want it out of the way, archive it instead.</p>
        <form action={deleteEnquiry.bind(null, id)} className="actions">
          <button className="btn btn-danger" type="submit">Yes, delete permanently</button>
          <Link className="btn btn-secondary" href={`/admin/enquiries/${r.id}/`}>Keep it</Link>
        </form>
      </section>
    </>
  );
}

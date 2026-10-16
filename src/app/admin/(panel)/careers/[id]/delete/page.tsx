import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { getRoles } from '@/server/content';
import { deleteRole } from '../../actions';

export const metadata = { title: 'Delete role' };

export default async function DeleteRole({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const role = (await getRoles()).find((r) => r.id === id);
  if (!role) notFound();
  return (
    <>
      <PageHead title="Delete this role?" crumbs={[['Dashboard', '/admin/'], ['Open roles', '/admin/careers/'], ['Delete', null]]} />
      <section className="card narrow">
        <span className="empty-ico"><Icon name="trash" /></span>
        <p><b>{role.title}</b> will be removed from the list. If you might hire for it again, hide it instead.</p>
        <form action={deleteRole.bind(null, id)} className="actions">
          <button className="btn btn-danger" type="submit">Yes, delete</button>
          <Link className="btn btn-secondary" href="/admin/careers/">Keep it</Link>
        </form>
      </section>
    </>
  );
}

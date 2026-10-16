import Link from 'next/link';
import { EmptyState, Flash, Icon, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { getRoles, ROLE_TYPES, TEAMS } from '@/server/content';
import { toggleRole } from './actions';

export const metadata = { title: 'Open roles' };

type Props = { searchParams: Promise<{ ok?: string; err?: string }> };

export default async function CareersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const roles = await getRoles();
  return (
    <>
      <PageHead
        title="Open roles"
        crumbs={[['Dashboard', '/admin/'], ['Open roles', null]]}
        lead={<>Roles listed here appear on the Careers page. Roles marked <b>Live</b> are shown. When nothing is live, the page shows its normal “send your CV” message.</>}
        actions={<Link className="btn btn-primary" href="/admin/careers/new/"><Icon name="plus" />Add a role</Link>}
      />
      <Flash ok={sp.ok} err={sp.err} />

      {roles.length === 0 ? (
        <EmptyState icon="briefcase" title="No roles yet">
          <p>Add one when you are hiring. It appears on the Careers page as soon as it is set to Live.</p>
          <Link className="btn btn-primary" href="/admin/careers/new/"><Icon name="plus" />Add a role</Link>
        </EmptyState>
      ) : (
        <ul className="roles">
          {roles.map((ro) => (
            <li className="card" key={ro.id}>
              <div className="row-between">
                <div>
                  <h2 className="role-title">{ro.title}</h2>
                  <p className="meta">{TEAMS[ro.team] ?? ro.team} · {ro.location} · {ROLE_TYPES[ro.type] ?? ro.type}</p>
                </div>
                <span className={`badge ${ro.active ? 'badge-won' : 'badge-lost'}`}>{ro.active ? 'Live' : 'Hidden'}</span>
              </div>
              <div className="actions">
                <form action={toggleRole.bind(null, ro.id)}>
                  <button className="btn btn-secondary btn-sm" type="submit"><Icon name="eye" />{ro.active ? 'Hide from website' : 'Show on website'}</button>
                </form>
                <Link className="btn btn-secondary btn-sm" href={`/admin/careers/${ro.id}/`}><Icon name="edit" />Edit</Link>
                <Link className="btn btn-quiet btn-sm" href={`/admin/careers/${ro.id}/delete/`}>Delete…</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

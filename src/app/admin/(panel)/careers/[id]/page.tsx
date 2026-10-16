import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flash, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { getRoles, ROLE_TYPES, TEAMS, type Role } from '@/server/content';
import { saveRole } from '../actions';

export const metadata = { title: 'Role' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

/** /admin/careers/new/ adds a role; /admin/careers/<id>/ edits one. */
export default async function RolePage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const roles = await getRoles();
  const existing = id === 'new' ? null : roles.find((r) => r.id === id) ?? null;
  if (id !== 'new' && !existing) notFound();
  const r: Pick<Role, 'title' | 'team' | 'type' | 'location' | 'description' | 'active'> = existing ?? { title: '', team: '', type: 'full-time', location: '', description: '', active: true };
  return (
    <>
      <PageHead title={existing ? 'Edit role' : 'Add a role'} crumbs={[['Dashboard', '/admin/'], ['Open roles', '/admin/careers/'], [existing ? 'Edit' : 'New', null]]} />
      <Flash ok={sp.ok} err={sp.err} />
      <form className="card narrow-form" action={saveRole.bind(null, id)}>
        <div className="form-grid">
          <div className="field field-wide">
            <label htmlFor="title">Role title</label>
            <input id="title" name="title" type="text" maxLength={80} required defaultValue={r.title} />
          </div>
          <div className="field">
            <label htmlFor="team">Team</label>
            <select id="team" name="team" required defaultValue={r.team}>
              <option value="">Choose a team</option>
              {Object.entries(TEAMS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" maxLength={80} required defaultValue={r.location} />
          </div>
          <div className="field">
            <label htmlFor="type">Employment type</label>
            <select id="type" name="type" required defaultValue={r.type}>
              {Object.entries(ROLE_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="field field-wide">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={8} maxLength={2000} defaultValue={r.description} />
            <p className="help">Plain text. What the person will do and what you are looking for. Do not publish a salary, qualification or benefit unless you have decided it.</p>
          </div>
        </div>
        <label className="switch"><input type="checkbox" name="active" value="1" defaultChecked={r.active} /><span>Show this role on the Careers page</span></label>
        <div className="sticky-actions"><button className="btn btn-primary" type="submit">Save role</button> <Link className="btn btn-quiet" href="/admin/careers/">Cancel</Link></div>
      </form>
    </>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, DeleteBox, Flash } from '@/components/admin/ui';
import { getRoles, ROLE_TYPES, TEAMS, type Role } from '@/server/content';
import { deleteRole, saveRole } from '../actions';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> };

/** /admin/careers/new/ adds a role; /admin/careers/<id>/ edits one. */
export default async function RolePage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const roles = await getRoles();
  const existing = id === 'new' ? null : roles.find((r) => r.id === id) ?? null;
  if (id !== 'new' && !existing) notFound();
  const r: Pick<Role, 'title' | 'team' | 'type' | 'location' | 'description' | 'active'> = existing ?? { title: '', team: '', type: 'full-time', location: '', description: '', active: true };
  return (
    <>
      <p><Link href="/admin/careers/">&larr; Open roles</Link></p>
      <h1>{existing ? 'Edit role' : 'Add role'}</h1>
      <Flash ok={sp.ok} err={sp.err} />
      <Card>
        <form action={saveRole.bind(null, id)} className="adm-form">
          <label>Role title *<input type="text" name="title" defaultValue={r.title} maxLength={80} required /></label>
          <div className="adm-row">
            <label>Team *
              <select name="team" defaultValue={r.team} required>
                <option value="">Choose...</option>
                {Object.entries(TEAMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Type *
              <select name="type" defaultValue={r.type} required>
                {Object.entries(ROLE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Location *<input type="text" name="location" defaultValue={r.location} maxLength={80} required /></label>
          </div>
          <label>Description<textarea name="description" defaultValue={r.description} maxLength={2000} rows={6} /></label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="active" defaultChecked={r.active} /> Show on the Careers page</label>
          <p><button className="adm-btn" type="submit">Save role</button></p>
        </form>
      </Card>
      {existing ? (
        <Card title="Danger zone">
          <DeleteBox label="Delete this role" action={deleteRole.bind(null, id)}><p>The role is removed from the website. Applications already received are kept.</p></DeleteBox>
        </Card>
      ) : null}
    </>
  );
}

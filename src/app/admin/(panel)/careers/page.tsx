import Link from 'next/link';
import { Badge, Flash } from '@/components/admin/ui';
import { getRoles, ROLE_TYPES, TEAMS } from '@/server/content';
import { toggleRole } from './actions';

type Props = { searchParams: Promise<{ ok?: string; err?: string }> };

export default async function CareersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const roles = await getRoles();
  return (
    <>
      <h1>Open roles</h1>
      <p className="sub">Roles shown on the website Careers page. Hidden roles stay saved.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <p><Link className="adm-btn" href="/admin/careers/new/">Add a role</Link></p>
      <section className="adm-card">
        {roles.length === 0 ? <p className="adm-empty">No roles yet.</p> : (
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>Role</th><th>Team</th><th>Type</th><th>Location</th><th>Shown</th><th /></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.id}>
                    <td><Link href={`/admin/careers/${r.id}/`}>{r.title}</Link></td>
                    <td>{TEAMS[r.team] ?? r.team}</td>
                    <td>{ROLE_TYPES[r.type] ?? r.type}</td>
                    <td>{r.location}</td>
                    <td><Badge s={r.active ? 'active' : 'inactive'} label={r.active ? 'Shown' : 'Hidden'} /></td>
                    <td>
                      <form action={toggleRole.bind(null, r.id)}>
                        <button className="adm-btn ghost" type="submit">{r.active ? 'Hide' : 'Show'}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

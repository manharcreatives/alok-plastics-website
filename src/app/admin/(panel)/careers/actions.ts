'use server';

import { redirect } from 'next/navigation';
import { audit, requireAdmin } from '@/server/admin-auth';
import { flash } from '@/server/admin-util';
import { getRoles, newRoleId, saveRoles, validateRole } from '@/server/content';

export async function toggleRole(id: string): Promise<void> {
  const user = await requireAdmin();
  const roles = await getRoles();
  const r = roles.find((x) => x.id === id);
  if (!r) redirect('/admin/careers/');
  r.active = !r.active;
  r.updatedAt = new Date().toISOString();
  await saveRoles(roles);
  await audit(user.username, 'role_toggle', id, r.active ? 'shown' : 'hidden');
  flash('/admin/careers/', 'ok', `"${r.title}" is now ${r.active ? 'shown on' : 'hidden from'} the Careers page.`);
}

export async function saveRole(id: string, form: FormData): Promise<void> {
  const user = await requireAdmin();
  const { role, errors } = validateRole(form);
  const back = id === 'new' ? '/admin/careers/new/' : `/admin/careers/${id}/`;
  if (Object.keys(errors).length > 0) flash(back, 'err', Object.values(errors).join(' '));
  const roles = await getRoles();
  const now = new Date().toISOString();
  const idx = id === 'new' ? -1 : roles.findIndex((r) => r.id === id);
  if (id !== 'new' && idx < 0) redirect('/admin/careers/');
  if (idx >= 0) roles[idx] = { ...role, id, createdAt: roles[idx]!.createdAt ?? now, updatedAt: now };
  else roles.unshift({ ...role, id: newRoleId(role.title), createdAt: now, updatedAt: now });
  await saveRoles(roles);
  await audit(user.username, idx >= 0 ? 'role_edit' : 'role_add', idx >= 0 ? id : roles[0]!.id, role.title);
  flash('/admin/careers/', 'ok', 'Role saved.');
}

export async function deleteRole(id: string): Promise<void> {
  const user = await requireAdmin();
  const roles = await getRoles();
  const r = roles.find((x) => x.id === id);
  if (!r) redirect('/admin/careers/');
  await saveRoles(roles.filter((x) => x.id !== id));
  await audit(user.username, 'role_delete', id, r.title);
  flash('/admin/careers/', 'ok', 'Role deleted.');
}

'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin, audit } from '@/server/admin-auth';
import { query, now } from '@/server/db';
import { STATUSES, getEnquiry } from '@/server/enquiries';

/* Every action re-checks the session: a server action is a public POST endpoint, never trust the page that rendered it. */

async function load(id: string) {
  const user = await requireAdmin();
  const row = await getEnquiry(id);
  if (!row) redirect('/admin/enquiries/');
  return { user, row };
}

export async function setStatus(id: string, form: FormData): Promise<void> {
  const { user, row } = await load(id);
  const status = String(form.get('status') ?? '');
  if (!(STATUSES as readonly string[]).includes(status)) return;
  await query('update enquiries set status = $2, updated_at = $3, seen = 1 where id = $1', [id, status, now()]);
  await audit(user.username, 'enquiry_status', `#${id}`, `${row.status} -> ${status}`);
  revalidatePath(`/admin/enquiries/${id}/`);
}

export async function addNote(id: string, form: FormData): Promise<void> {
  const { user, row } = await load(id);
  const text = String(form.get('text') ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 1000);
  if (!text) return;
  const notes = [...row.notes, { by: user.name, at: now(), text }];
  await query('update enquiries set notes = $2::jsonb, updated_at = $3 where id = $1', [id, JSON.stringify(notes), now()]);
  await audit(user.username, 'enquiry_note', `#${id}`);
  revalidatePath(`/admin/enquiries/${id}/`);
}

export async function toggleArchive(id: string): Promise<void> {
  const { user, row } = await load(id);
  await query('update enquiries set archived = $2, updated_at = $3 where id = $1', [id, row.archived ? 0 : 1, now()]);
  await audit(user.username, row.archived ? 'enquiry_unarchive' : 'enquiry_archive', `#${id}`);
  redirect('/admin/enquiries/');
}

export async function deleteEnquiry(id: string): Promise<void> {
  const { user } = await load(id);
  await query('delete from enquiries where id = $1', [id]);
  await audit(user.username, 'enquiry_delete', `#${id}`);
  redirect('/admin/enquiries/');
}

export async function assignTo(id: string, form: FormData): Promise<void> {
  const { user, row } = await load(id);
  const who = String(form.get('assigned_to') ?? '').replace(/<[^>]*>/g, '').trim().slice(0, 60);
  await query('update enquiries set assigned_to = $2, updated_at = $3 where id = $1', [id, who, now()]);
  await audit(user.username, 'enquiry_assign', `#${id}`, `${row.assigned_to || '-'} -> ${who || '-'}`);
  revalidatePath(`/admin/enquiries/${id}/`);
}

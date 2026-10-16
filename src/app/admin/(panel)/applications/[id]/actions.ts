'use server';

import { redirect } from 'next/navigation';
import { audit, requireAdmin } from '@/server/admin-auth';
import { applications } from '@/server/collection';
import { deleteFile } from '@/server/files';
import { flash, makeNote } from '@/server/admin-util';
import { APPLICATION_LABELS, APPLICATION_STATUSES } from '@/server/shop';

const here = (id: string): string => `/admin/applications/${id}/`;

async function load(id: string) {
  const user = await requireAdmin();
  const a = await applications().find(Number(id));
  if (!a) redirect('/admin/applications/');
  return { user, a };
}

export async function setApplicationStatus(id: string, form: FormData): Promise<void> {
  const { user, a } = await load(id);
  const status = String(form.get('status') ?? '');
  if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) flash(here(id), 'err', 'Unknown status.');
  await applications().update(a.id, { status });
  await audit(user.username, 'application_status', `#${a.id}`, `${a.status} -> ${status}`);
  flash(here(id), 'ok', `Application marked as ${APPLICATION_LABELS[status]}.`);
}

export async function addApplicationNote(id: string, form: FormData): Promise<void> {
  const { user, a } = await load(id);
  const note = makeNote(user.name, form.get('note'));
  if (!note) flash(here(id), 'err', 'Write a note of up to 1000 characters.');
  await applications().update(a.id, { notes: [...a.notes, note as NonNullable<typeof note>] });
  flash(here(id), 'ok', 'Note added.');
}

export async function deleteApplication(id: string): Promise<void> {
  const { user, a } = await load(id);
  if (a.resume_file) await deleteFile(a.resume_file);
  await applications().delete(a.id);
  await audit(user.username, 'application_delete', `#${a.id}`, a.name);
  flash('/admin/applications/', 'ok', 'Application deleted.');
}

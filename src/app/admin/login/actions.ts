'use server';

import { redirect } from 'next/navigation';
import { signIn, signOut, audit, currentAdmin } from '@/server/admin-auth';

export type LoginState = { error: string | null; username?: string };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get('username') ?? '').slice(0, 60);
  const error = await signIn(username, String(form.get('password') ?? ''));
  if (error) return { error, username };
  redirect('/admin/');
}

export async function logoutAction(): Promise<void> {
  const user = await currentAdmin();
  await signOut();
  if (user) await audit(user.username, 'logout');
  redirect('/admin/login/');
}

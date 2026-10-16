'use server';

import { redirect } from 'next/navigation';
import { signIn, signOut, audit, currentAdmin } from '@/server/admin-auth';

export type LoginState = { error: string | null };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const error = await signIn(String(form.get('username') ?? ''), String(form.get('password') ?? ''));
  if (error) return { error };
  redirect('/admin/');
}

export async function logoutAction(): Promise<void> {
  const user = await currentAdmin();
  await signOut();
  if (user) await audit(user.username, 'logout');
  redirect('/admin/login/');
}

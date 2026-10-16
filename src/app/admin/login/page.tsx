import { redirect } from 'next/navigation';
import { currentAdmin } from '@/server/admin-auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await currentAdmin()) redirect('/admin/');
  return (
    <main className="adm-login">
      <h1>Alok Plastics admin</h1>
      <p className="sub">Sign in to manage enquiries.</p>
      <LoginForm />
    </main>
  );
}

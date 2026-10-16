import { redirect } from 'next/navigation';
import { currentAdmin } from '@/server/admin-auth';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await currentAdmin()) redirect('/admin/');
  return (
    <main id="main" tabIndex={-1} className="main-bare">
      <section className="auth">
        <div className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/alok-logo-white.svg" alt="Alok Plastics" width={168} height={61} />
          <div>
            <p className="auth-eyebrow">Admin</p>
            <p className="auth-statement">Enquiries, products and open roles in one place.</p>
          </div>
        </div>
        <div className="auth-form">
          <h1>Sign in</h1>
          <p className="sub">Use the username and password given to you.</p>
          <LoginForm />
          <p className="meta">Private area for Alok Plastics staff. Activity is logged.</p>
        </div>
      </section>
    </main>
  );
}

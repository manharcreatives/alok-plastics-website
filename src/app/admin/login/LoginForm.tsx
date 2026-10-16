'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  return (
    <form action={action} className="adm-card">
      {state.error ? <div className="adm-err" role="alert">{state.error}</div> : null}
      <label htmlFor="username">Username</label>
      <input id="username" name="username" type="text" autoComplete="username" required maxLength={60} defaultValue={state.username ?? ''} />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      <button className="adm-btn" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from './actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  return (
    <>
      {state.error ? (
        <p className="flash flash-err" role="alert">
          <svg className="ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4 2.5 20h19L12 4ZM12 10v4m0 3v.01" /></svg>
          <span>{state.error}</span>
        </p>
      ) : null}
      <form action={action} autoComplete="on">
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" key={state.username ?? ''} defaultValue={state.username ?? ''} autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={60} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </>
  );
}

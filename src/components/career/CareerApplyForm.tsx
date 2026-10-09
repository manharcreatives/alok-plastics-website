'use client';

import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { careerConfig } from '@/content/career';
import { useRuntimeRoles } from '@/components/runtime/useRuntime';

export const CAREER_ENDPOINT = '/api/career.php';
const MAX_RESUME_BYTES = 3 * 1024 * 1024;
const GENERAL = 'General application';

const CSS = `
.ca-form { display: grid; gap: var(--space-sm); max-width: 640px; }
.ca-form__grid { display: grid; gap: var(--space-sm); }
@media (min-width: 640px) { .ca-form__grid { grid-template-columns: 1fr 1fr; } .ca-form__full { grid-column: 1 / -1; } }
.ca-field label { display: block; margin-bottom: 6px; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em; color: var(--body); }
.ca-field input, .ca-field select, .ca-field textarea { width: 100%; box-sizing: border-box; min-height: 48px; padding: 0 14px; background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); color: var(--ink); font: inherit; font-size: 0.9375rem; transition: border-color 200ms ease-out; }
.ca-field textarea { padding: 12px 14px; min-height: 120px; resize: vertical; }
.ca-field input[type="file"] { padding: 10px 14px; min-height: 48px; }
.ca-field input:focus-visible, .ca-field select:focus-visible, .ca-field textarea:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 1px; }
.ca-field [aria-invalid="true"] { border-color: var(--error); }
.ca-field__err { margin: 4px 0 0; font-size: 0.8125rem; color: var(--error); }
.ca-field__help { margin: 4px 0 0; font-size: 0.8125rem; color: var(--muted); }
.ca-form__error { margin: 0; padding: var(--space-xs) var(--space-sm); border-left: 3px solid var(--error); background: var(--surface); color: var(--error); font-size: 0.9375rem; line-height: 1.45; }
.ca-form__submit { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-xs); min-height: 52px; padding: 0 var(--space-lg); border-radius: var(--radius-card); border: 1px solid var(--burgundy); background: var(--burgundy); color: var(--surface); font: inherit; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background-color 200ms ease-out; width: fit-content; }
.ca-form__submit:hover:not(:disabled) { background: var(--burgundy-deep); border-color: var(--burgundy-deep); }
.ca-form__submit:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.ca-form__submit:disabled { background: var(--grey-cloud); border-color: var(--grey-warm); color: var(--muted); cursor: not-allowed; }
.ca-done { max-width: 640px; padding: var(--space-lg) var(--space-md); border: 1px solid var(--pink-soft); border-left: 2px solid var(--burgundy); border-radius: var(--radius-card); background: var(--blush); display: grid; gap: var(--space-xs); }
.ca-done h3 { display: flex; align-items: center; gap: var(--space-xs); margin: 0; font-family: var(--font-archivo); font-weight: 650; font-size: var(--fs-h3); letter-spacing: var(--tr-h3); line-height: var(--lh-h3); color: var(--ink); }
.ca-done p { margin: 0; color: var(--body); line-height: 1.65; }
.ca-done button { width: fit-content; margin-top: var(--space-xs); min-height: 44px; padding: 0; background: none; border: 0; font: inherit; font-weight: 600; color: var(--burgundy); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.ca-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
`;

type Errors = Record<string, string>;

function tenDigits(raw: string): boolean {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d);
}

function parseUrl(raw: string): URL | null {
  const v = raw.trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.hostname.includes('.') ? u : null;
  } catch {
    return null;
  }
}

function isLinkedIn(raw: string): boolean {
  const u = parseUrl(raw);
  if (!u) return false;
  const host = u.hostname.toLowerCase();
  return (host === 'linkedin.com' || host.endsWith('.linkedin.com')) && /^\/(in|company)\/[^/]+/i.test(u.pathname);
}

export default function CareerApplyForm() {
  const uid = useId();
  const runtimeRoles = useRuntimeRoles();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState('');

  const positions = useMemo(() => {
    const roles = runtimeRoles.length > 0 ? runtimeRoles.map(r => r.title) : careerConfig.openRoles.filter(r => r.published).map(r => r.title);
    return [...roles, GENERAL];
  }, [runtimeRoles]);

  const id = (k: string) => `${uid}-${k}`;
  const attrs = (k: string) => ({
    id: id(k),
    name: k,
    'aria-invalid': errors[k] ? (true as const) : undefined,
    'aria-describedby': errors[k] ? `${id(k)}-err` : undefined,
  });
  const err = (k: string) => errors[k] ? <p id={`${id(k)}-err`} className="ca-field__err" role="alert">{errors[k]}</p> : null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = (k: string) => String(fd.get(k) ?? '').trim();
    const file = fd.get('resume');
    const hasFile = file instanceof File && file.size > 0;
    const next: Errors = {};
    if (text('name').length < 2) next.name = 'Enter your full name.';
    if (!tenDigits(text('phone'))) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email'))) next.email = 'Enter a valid email address.';
    if (!text('position')) next.position = 'Select a position.';
    if (!isLinkedIn(text('resumeUrl'))) next.resumeUrl = 'Enter your LinkedIn profile link.';
    if (hasFile) {
      const f = file as File;
      if (!/\.(pdf|docx?)$/i.test(f.name)) next.resume = 'Upload a PDF, DOC or DOCX file.';
      else if (f.size > MAX_RESUME_BYTES) next.resume = 'The file must be under 3 MB.';
    }
    setErrors(next);
    setFormError('');
    const first = Object.keys(next)[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (!hasFile) fd.delete('resume');
    setBusy(true);
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 60_000) : null;
    try {
      const res = await fetch(CAREER_ENDPOINT, { method: 'POST', body: fd, signal: ctrl?.signal });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; errors?: Errors; error?: string } | null;
      if (res.ok && j?.ok === true) {
        setDone(true);
        form.reset();
      } else if (res.status === 422 && j?.errors) {
        setErrors(j.errors);
        setFormError('Please fix the highlighted fields and try again.');
      } else if (res.status === 429) {
        setFormError(j?.error ?? 'Too many submissions. Please try again later.');
      } else {
        setFormError(j?.error ?? 'We could not submit your application right now. Please try again in a moment.');
      }
    } catch {
      setFormError('We could not reach the server. Please check your connection and try again.');
    } finally {
      if (timer) clearTimeout(timer);
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ca-done" role="status" aria-live="polite">
          <h3><CheckCircle weight="light" size={28} aria-hidden="true" /> Application received</h3>
          <p>Thank you for your interest in Alok Plastics. Our team will review your details and get in touch if there is a fit.</p>
          <button type="button" onClick={() => setDone(false)}>Submit another application</button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <form ref={formRef} className="ca-form" onSubmit={onSubmit} noValidate aria-label="Job application">
        <div className="ca-hp" aria-hidden="true">
          <label>Leave this field empty<input type="text" name="_honey" tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div className="ca-form__grid">
          <div className="ca-field">
            <label htmlFor={id('name')}>Full name *</label>
            <input {...attrs('name')} type="text" autoComplete="name" maxLength={80} aria-required="true" />
            {err('name')}
          </div>
          <div className="ca-field">
            <label htmlFor={id('phone')}>Mobile number *</label>
            <input {...attrs('phone')} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} aria-required="true" />
            {err('phone')}
          </div>
          <div className="ca-field">
            <label htmlFor={id('email')}>Email *</label>
            <input {...attrs('email')} type="email" autoComplete="email" maxLength={120} aria-required="true" />
            {err('email')}
          </div>
          <div className="ca-field">
            <label htmlFor={id('position')}>Position *</label>
            <select {...attrs('position')} defaultValue={positions.length === 1 ? GENERAL : ''} aria-required="true">
              <option value="" disabled>Select a position</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {err('position')}
          </div>
          <div className="ca-field ca-form__full">
            <label htmlFor={id('resume')}>Resume (PDF, DOC or DOCX, up to 3 MB)</label>
            <input {...attrs('resume')} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
            {err('resume')}
          </div>
          <div className="ca-field ca-form__full">
            <label htmlFor={id('resumeUrl')}>LinkedIn profile</label>
            <input {...attrs('resumeUrl')} type="url" inputMode="url" placeholder="https://www.linkedin.com/in/your-profile" maxLength={400} aria-required="true" />
            {err('resumeUrl')}
            <p className="ca-field__help">Your LinkedIn profile link.</p>
          </div>
          <div className="ca-field ca-form__full">
            <label htmlFor={id('message')}>Message <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></label>
            <textarea {...attrs('message')} maxLength={2000} />
            {err('message')}
          </div>
        </div>
        {formError && <p className="ca-form__error" role="alert">{formError}</p>}
        <button type="submit" className="ca-form__submit" disabled={busy}>
          <PaperPlaneTilt weight="light" size={20} aria-hidden="true" />
          {busy ? 'Sending…' : 'Submit application'}
        </button>
      </form>
    </>
  );
}

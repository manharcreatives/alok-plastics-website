'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { requestOtp, setSession, verifyOtp } from '@/lib/auth-client';

interface Props {
  onUnavailable: () => void;
}

const RESEND_SECONDS = 30;

function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export default function CartAuth({ onUnavailable }: Props) {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [wait, setWait] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  useEffect(() => {
    if (step === 'otp') codeRef.current?.focus();
  }, [step]);

  const send = async (): Promise<void> => {
    const fullName = name.trim().replace(/\s+/g, ' ');
    const ten = normalisePhone(phone);
    const errs: Record<string, string> = {};
    if (fullName.length < 2) errs.name = 'Enter your full name.';
    if (!ten) errs.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(errs);
    if (errs.name || errs.phone || !ten) return;
    setBusy(true);
    setNotice('');
    const res = await requestOtp(fullName, ten);
    setBusy(false);
    if (res.ok) {
      setName(fullName);
      setPhone(ten);
      setCode(res.devCode ?? '');
      setStep('otp');
      setWait(RESEND_SECONDS);
      setNotice(res.devCode ? 'Test mode: the code has been filled in for you.' : `We sent a 6-digit code to +91 ${ten}.`);
      return;
    }
    if (res.kind === 'unavailable') {
      onUnavailable();
      return;
    }
    if (res.kind === 'validation') {
      setErrors(res.errors);
      return;
    }
    setErrors({ form: res.message });
  };

  const onDetails = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, '');
    if (digits.length !== 6) {
      setErrors({ code: 'Enter the 6-digit code.' });
      return;
    }
    setBusy(true);
    setErrors({});
    const res = await verifyOtp(name, phone, digits);
    setBusy(false);
    if (res.ok) {
      setSession(res.session);
      return;
    }
    if (res.kind === 'unavailable') {
      setErrors({ form: res.message });
      return;
    }
    setErrors({ code: res.kind === 'validation' ? 'Enter the 6-digit code.' : res.message });
  };

  const resend = async () => {
    if (wait > 0 || busy) return;
    setBusy(true);
    const res = await requestOtp(name, phone);
    setBusy(false);
    if (res.ok) {
      setCode(res.devCode ?? '');
      setWait(RESEND_SECONDS);
      setNotice('A new code has been sent.');
      setErrors({});
      return;
    }
    setErrors({ form: res.kind === 'validation' ? 'Check your name and mobile number.' : res.message });
  };

  if (step === 'otp') {
    return (
      <form className="cf" onSubmit={onVerify} noValidate aria-label="Verify your mobile number">
        <p className="ca__lead">Enter the code sent to <strong>+91 {phone}</strong></p>
        <div className="cf__field">
          <label htmlFor="ca-code">6-digit code</label>
          <input
            ref={codeRef}
            id="ca-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-required="true"
            aria-invalid={errors.code ? true : undefined}
            aria-describedby={errors.code ? 'ca-code-err' : undefined}
            className="ca__code"
          />
          {errors.code && <p id="ca-code-err" className="cf__err" role="alert">{errors.code}</p>}
        </div>
        {notice && <p className="ca__note" role="status">{notice}</p>}
        {errors.form && <p className="cf__err" role="alert">{errors.form}</p>}
        <button type="submit" className="cbtn cbtn--block" disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
        <div className="ca__row">
          <button type="button" className="clink clink--muted" onClick={() => void resend()} disabled={wait > 0 || busy}>
            {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
          </button>
          <button type="button" className="clink clink--muted" onClick={() => { setStep('details'); setCode(''); setErrors({}); setNotice(''); }}>
            Change number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="cf" onSubmit={onDetails} noValidate aria-label="Sign in to place your order">
      <p className="ca__lead">Verify your mobile number to place your order.</p>
      <div className="cf__field">
        <label htmlFor="ca-name">Full name *</label>
        <input
          id="ca-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'ca-name-err' : undefined}
        />
        {errors.name && <p id="ca-name-err" className="cf__err" role="alert">{errors.name}</p>}
      </div>
      <div className="cf__field">
        <label htmlFor="ca-phone">Mobile number *</label>
        <div className="ca__phone">
          <span className="ca__cc" aria-hidden="true">+91</span>
          <input
            id="ca-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            aria-required="true"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'ca-phone-err' : undefined}
          />
        </div>
        {errors.phone && <p id="ca-phone-err" className="cf__err" role="alert">{errors.phone}</p>}
      </div>
      {errors.form && <p className="cf__err" role="alert">{errors.form}</p>}
      <button type="submit" className="cbtn cbtn--block" disabled={busy}>{busy ? 'Sending code…' : 'Send verification code'}</button>
    </form>
  );
}

/**
 * ShortEnquiryForm — §14 (short form variant)
 * Used in: EnquirySection (S11), and can be reused in footer band.
 * Posts to /api/enquiry.php. Validates via Zod schema.
 * States: idle · submitting · success · error.
 * Required: Name, Company, Phone, Product. Optional: buyer type, quantity, notes.
 * On success: offers Call / Email / Browse products (never WhatsApp: that lives in the FAB only).
 * If the endpoint is unreachable (static preview / PHP down): email
 * fallback via EnquiryFallback — the typed values stay in the form.
 *
 * Styling: designed for use inside an --burgundy background (on-dark).
 * Pass onLight=true for use on --canvas or --surface backgrounds.
 */

'use client';

import { useState } from 'react';
import type { FormEvent, CSSProperties } from 'react';
import { validateShortForm } from '@/lib/enquiry-schema';
import { enquiryLines } from '@/lib/whatsapp';
import { postEnquiry } from '@/lib/enquiry-submit';
import { trackEnquirySubmit } from '@/lib/analytics';
import { useHiddenProductSlugs, useRuntimeProductMap } from '@/components/runtime/useRuntime';
import EnquiryFallback from './EnquiryFallback';
import SuccessNext from './SuccessNext';
import { BUYER_TYPES, FORM_CSS, productOptionGroups } from './shared';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type Source = 'home-enquiry' | 'enquiry-page' | 'product-page' | 'footer';

interface Props {
  source?: Source;
  onLight?: boolean;
  prefillProduct?: string;
}

/* Product options: published products grouped like the catalogue, plus "Custom part" */
const CUSTOM_OPTION = { value: 'custom', label: 'Custom part / Other requirement' };

/* DOM order — used to focus the first invalid field */
const FIELD_ORDER = ['name', 'company', 'phone', 'product', 'quantity', 'message'] as const;
const FIELD_ID: Record<string, string> = {
  name: 'senq-name', company: 'senq-company', phone: 'senq-phone',
  product: 'senq-product', quantity: 'senq-qty', message: 'senq-message',
};

export default function ShortEnquiryForm({
  source = 'home-enquiry',
  onLight = false,
  prefillProduct = '',
}: Props) {
  const hidden = useHiddenProductSlugs();
  const edits = useRuntimeProductMap();
  const optionGroups = productOptionGroups(hidden, edits);
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fallbackLines, setFallbackLines] = useState<string[]>([]);
  const [rateLimited, setRateLimited] = useState(false);

  const fg = onLight ? 'var(--ink)' : 'white';
  const fgMuted = onLight ? 'var(--muted)' : 'rgba(255,255,255,0.8)';
  const fgLabel = onLight ? 'var(--body)' : 'var(--rose-pale)';

  const inputStyle = (hasErr: boolean): CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    height: 48, padding: '0 14px',
    background: onLight ? 'var(--surface)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${hasErr
      ? (onLight ? 'var(--error)' : 'var(--rose-pale)')
      : (onLight ? 'var(--grey-warm)' : 'rgba(255,255,255,0.35)')}`,
    borderRadius: 'var(--radius-card)',
    color: fg,
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    WebkitAppearance: 'none',
    appearance: 'none',
    transition: 'border-color 0.15s',
  });

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    color: fgLabel,
    fontWeight: 600,
    letterSpacing: '0.08em',
    marginBottom: 6,
  };

  const errStyle: CSSProperties = {
    fontSize: '0.8125rem',
    color: onLight ? 'var(--error)' : 'var(--rose-pale)',
    marginTop: 4,
  };

  const optStyle: CSSProperties = { fontWeight: 400, opacity: 0.85, letterSpacing: 0 };

  const focusFirstError = (form: HTMLFormElement, errs: Record<string, string>) => {
    const first = FIELD_ORDER.find(k => errs[k]);
    if (!first) return;
    const el = form.querySelector<HTMLElement>(`#${FIELD_ID[first]}`);
    el?.focus();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const result = validateShortForm(data);

    if (!result.ok) {
      const errs = result.errors ?? {};
      setErrors(errs);
      focusFirstError(form, errs);
      return;
    }
    setErrors({});
    setState('submitting');
    const d = result.data!;
    const lines = enquiryLines({
      name: d.name, company: d.company, phone: d.phone,
      product: d.product, quantity: d.quantity, unit: d.quantityUnit, message: d.message,
    });

    const res = await postEnquiry(data);
    if (res.ok) {
      setState('success');
      trackEnquirySubmit({ source, buyerType: d.buyerType });
      form.reset();
      return;
    }
    if (res.kind === 'validation') {
      setErrors(res.errors);
      setState('idle');
      focusFirstError(form, res.errors);
      return;
    }
    /* Endpoint unreachable / mail failed / rate-limited — keep values, offer fallback */
    setFallbackLines(lines);
    setRateLimited(res.kind === 'rate-limited');
    setState('error');
  };

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={onLight ? 'enq-form' : 'enq-form enq-dark'}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}
      >
        <style>{FORM_CSS}</style>
        <p style={{ fontSize: '1.0625rem', color: fg, fontWeight: 600 }}>
          Enquiry received.
        </p>
        <p style={{ fontSize: '0.9375rem', color: fgMuted, lineHeight: 1.6 }}>
          {/* TODO(client): confirm reply time before launch */}
          We&rsquo;ll get back to you within 24 hours, usually the same day if you&rsquo;ve sent this before noon IST.
        </p>
        <SuccessNext onLight={onLight} />
        <button
          type="button"
          onClick={() => setState('idle')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', color: fgMuted, textDecoration: 'underline',
            padding: '8px 0', minHeight: 44, width: 'fit-content',
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const describe = (key: string, id: string) => (errors[key] ? id : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Short enquiry form"
      className={onLight ? 'enq-form' : 'enq-form enq-dark'}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 0 }}
    >
      <style>{FORM_CSS}</style>

      <p style={{ fontSize: '0.8125rem', color: fgMuted }}>
        Fields marked * are required.
      </p>

      {/* Row: Name + Company */}
      <div className="enq-row-2">
        <div className="enq-field">
          <label htmlFor="senq-name" style={labelStyle}>Name *</label>
          <input
            id="senq-name" name="name" type="text"
            autoComplete="name" aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe('name', 'senq-name-err')}
            style={inputStyle(!!errors.name)}
            placeholder="Your name"
          />
          {errors.name && <p id="senq-name-err" role="alert" style={errStyle}>{errors.name}</p>}
        </div>
        <div className="enq-field">
          <label htmlFor="senq-company" style={labelStyle}>Company *</label>
          <input
            id="senq-company" name="company" type="text"
            autoComplete="organization" aria-required="true"
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={describe('company', 'senq-company-err')}
            style={inputStyle(!!errors.company)}
            placeholder="Company name"
          />
          {errors.company && <p id="senq-company-err" role="alert" style={errStyle}>{errors.company}</p>}
        </div>
      </div>

      {/* Row: Phone + Buyer type */}
      <div className="enq-row-2">
        <div className="enq-field">
          <label htmlFor="senq-phone" style={labelStyle}>Phone *</label>
          <input
            id="senq-phone" name="phone" type="tel"
            autoComplete="tel" inputMode="tel" aria-required="true"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describe('phone', 'senq-phone-err')}
            style={inputStyle(!!errors.phone)}
            placeholder="+91 XXXXX XXXXX"
          />
          {errors.phone && <p id="senq-phone-err" role="alert" style={errStyle}>{errors.phone}</p>}
        </div>
        <div className="enq-field">
          <label htmlFor="senq-buyer-type" style={labelStyle}>I am a <span style={optStyle}>(optional)</span></label>
          <select
            id="senq-buyer-type" name="buyerType" defaultValue=""
            style={{ ...inputStyle(false), cursor: 'pointer' }}
          >
            <option value="">Select&hellip;</option>
            {BUYER_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product */}
      <div className="enq-field">
        <label htmlFor="senq-product" style={labelStyle}>Product / Requirement *</label>
        <select
          id="senq-product" name="product"
          aria-required="true"
          aria-invalid={errors.product ? true : undefined}
          aria-describedby={describe('product', 'senq-product-err')}
          defaultValue={prefillProduct || ''}
          style={{ ...inputStyle(!!errors.product), cursor: 'pointer' }}
        >
          <option value="" disabled>Select a product or custom requirement&hellip;</option>
          {optionGroups.map(g => (
            <optgroup key={g.id} label={g.label}>
              {g.items.map(it => <option key={it.slug} value={it.name}>{it.name}</option>)}
            </optgroup>
          ))}
          <option value={CUSTOM_OPTION.label}>{CUSTOM_OPTION.label}</option>
        </select>
        {errors.product && <p id="senq-product-err" role="alert" style={errStyle}>{errors.product}</p>}
      </div>

      {/* Row: Quantity + Unit */}
      <div className="enq-row-qty">
        <div className="enq-field">
          <label htmlFor="senq-qty" style={labelStyle}>Quantity (approx.) <span style={optStyle}>(optional)</span></label>
          <input
            id="senq-qty" name="quantity" type="number" inputMode="numeric"
            min="1" max="9999999"
            aria-invalid={errors.quantity ? true : undefined}
            aria-describedby={describe('quantity', 'senq-qty-err')}
            style={inputStyle(!!errors.quantity)}
            placeholder="e.g. 500"
          />
          {errors.quantity && <p id="senq-qty-err" role="alert" style={errStyle}>{errors.quantity}</p>}
        </div>
        <div className="enq-field">
          <label htmlFor="senq-unit" style={labelStyle}>Unit</label>
          <select
            id="senq-unit" name="quantityUnit"
            style={{ ...inputStyle(false), cursor: 'pointer' }}
          >
            <option value="pcs">Pieces</option>
            <option value="sets">Sets</option>
          </select>
        </div>
      </div>

      {/* Message — OPTIONAL (schema: optional) */}
      <div className="enq-field">
        <label htmlFor="senq-message" style={labelStyle}>Additional notes <span style={optStyle}>(optional)</span></label>
        <textarea
          id="senq-message" name="message"
          rows={3}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe('message', 'senq-message-err')}
          style={{ ...inputStyle(!!errors.message), height: 'auto', padding: '12px 14px', resize: 'vertical' }}
          placeholder="Material preference, machine type, sizes, urgency…"
        />
        {errors.message && <p id="senq-message-err" role="alert" style={errStyle}>{errors.message}</p>}
      </div>

      {/* Honeypot + source */}
      <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="_source" value={source} />

      {state === 'error' && (
        <EnquiryFallback
          summaryLines={fallbackLines}
          onLight={onLight}
          rateLimited={rateLimited}
          onRetry={() => setState('idle')}
        />
      )}

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={state === 'submitting'}
          style={{
            padding: '14px 28px', minHeight: 48,
            background: onLight ? 'var(--burgundy)' : 'white',
            color: onLight ? 'white' : 'var(--burgundy)',
            border: 'none', borderRadius: 'var(--radius-card)',
            fontFamily: 'var(--font-archivo)',
            fontVariationSettings: '"wdth" 110',
            fontWeight: 650, fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            cursor: state === 'submitting' ? 'wait' : 'pointer',
            opacity: state === 'submitting' ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
          aria-busy={state === 'submitting'}
        >
          {state === 'submitting' ? 'Sending…' : 'Send Enquiry'}
        </button>
      </div>

      <p style={{ fontSize: '0.8125rem', color: fgMuted, lineHeight: 1.5 }}>
        No spam. Your information is used only to respond to your enquiry.
      </p>
    </form>
  );
}

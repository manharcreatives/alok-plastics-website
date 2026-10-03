/**
 * FullEnquiryForm — §14.2 (bulk enquiry form for /enquiry page)
 * Multi-line product selection, GSTIN, company details.
 * Posts to /api/enquiry.php. Validates via Zod fullEnquirySchema.
 * Required: Name, Company, Phone, "I am a", at least one product.
 * Optional: Email, City, State, GSTIN, quantities, Additional notes.
 * Endpoint unreachable (static preview / PHP down) -> EnquiryFallback (email / retry).
 * Designed for --canvas / --surface background (onLight = true).
 */

'use client';

import { useState } from 'react';
import type { FormEvent, CSSProperties } from 'react';
import { fullEnquirySchema, flattenZodErrors } from '@/lib/enquiry-schema';
import { enquiryLines } from '@/lib/whatsapp';
import { postEnquiry } from '@/lib/enquiry-submit';
import { trackEnquirySubmit } from '@/lib/analytics';
import { publishedProducts } from '@/content/products';
import { useHiddenProductSlugs, useRuntimeProductMap } from '@/components/runtime/useRuntime';
import EnquiryFallback from './EnquiryFallback';
import SuccessNext from './SuccessNext';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { BUYER_TYPES, FORM_CSS } from './shared';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface LineItem {
  product: string;
  quantity: string;
  unit: 'pcs' | 'sets';
}

const PRODUCT_OPTIONS = [
  ...publishedProducts.map(p => p.name),
  'Custom part / Other',
];

const INITIAL_LINE: LineItem = { product: '', quantity: '', unit: 'pcs' };

/* DOM order -> element id, used to focus the first invalid field */
const FIELD_ORDER: Array<[string, string]> = [
  ['name', 'fenq-name'],
  ['company', 'fenq-company'],
  ['phone', 'fenq-phone'],
  ['email', 'fenq-email'],
  ['city', 'fenq-city'],
  ['state', 'fenq-state'],
  ['gstin', 'fenq-gstin'],
  ['buyerType', 'fenq-buyer-type'],
];

/* ── Shared styles ──────────────────────────────────────────────── */

const inputBase: CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  height: 48, padding: '0 14px',
  background: 'var(--surface)',
  border: '1px solid var(--grey-warm)',
  borderRadius: 'var(--radius-card)',
  color: 'var(--ink)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  WebkitAppearance: 'none',
  appearance: 'none',
  transition: 'border-color 0.2s',
};

const labelBase: CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  color: 'var(--body)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  marginBottom: 6,
};

const errBase: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--error)',
  marginTop: 4,
};

const optStyle: CSSProperties = { fontWeight: 400, letterSpacing: 0, color: 'var(--muted)' };

function inputStyle(hasErr: boolean): CSSProperties {
  return { ...inputBase, borderColor: hasErr ? 'var(--error)' : 'var(--grey-warm)' };
}

export default function FullEnquiryForm({ prefillProduct }: { prefillProduct?: string }) {
  const hidden = useHiddenProductSlugs();
  const edits = useRuntimeProductMap();
  /* owner-edited names win for the label and the value that gets submitted */
  const productOptions = [
    ...publishedProducts.filter(p => !hidden.has(p.slug)).map(p => edits?.get(p.slug)?.name ?? p.name),
    PRODUCT_OPTIONS[PRODUCT_OPTIONS.length - 1],
  ];
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fallbackLines, setFallbackLines] = useState<string[]>([]);
  const [rateLimited, setRateLimited] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([
    prefillProduct
      ? { product: prefillProduct, quantity: '', unit: 'pcs' }
      : { ...INITIAL_LINE },
  ]);

  const addLine = () => setLines(prev => [...prev, { ...INITIAL_LINE }]);
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const updateLine = (i: number, field: keyof LineItem, value: string) => {
    setLines(prev => prev.map((l, idx) =>
      idx === i ? { ...l, [field]: value } : l,
    ));
  };

  const focusFirstError = (form: HTMLFormElement, errs: Record<string, string>) => {
    let id: string | undefined = FIELD_ORDER.find(([k]) => errs[k])?.[1];
    if (!id) {
      const lineKey = Object.keys(errs).find(k => k.startsWith('lines'));
      if (lineKey) {
        const idx = /^lines\.(\d+)\./.exec(lineKey)?.[1] ?? '0';
        const sub = lineKey.endsWith('quantity') ? 'qty' : 'product';
        id = `fenq-line-${idx}-${sub}`;
      } else if (errs.message) {
        id = 'fenq-message';
      }
    }
    if (id) form.querySelector<HTMLElement>(`#${id}`)?.focus();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    /* Build structured payload */
    const payload = {
      name:      (fd.get('name') as string) ?? '',
      company:   (fd.get('company') as string) ?? '',
      phone:     (fd.get('phone') as string) ?? '',
      email:     (fd.get('email') as string) || '',
      city:      (fd.get('city') as string) || '',
      state:     (fd.get('state') as string) || '',
      gstin:     ((fd.get('gstin') as string) || '').trim().toUpperCase(),
      buyerType: (fd.get('buyerType') as string) ?? '',
      message:   (fd.get('message') as string) || '',
      lines:     lines.map(l => ({
        product:  l.product,
        quantity: l.quantity ? parseInt(l.quantity, 10) : undefined,
        unit:     l.unit,
      })),
      _honey:  (fd.get('_honey') as string) || undefined,
      _source: 'enquiry-page',
    };

    const result = fullEnquirySchema.safeParse(payload);
    if (!result.success) {
      const errs = flattenZodErrors(result.error);
      setErrors(errs);
      focusFirstError(form, errs);
      return;
    }
    setErrors({});
    setState('submitting');

    const d = result.data;
    const productSummary = d.lines.map(l =>
      l.quantity ? `${l.product} (${l.quantity} ${l.unit})` : l.product).join(', ');
    const summary = enquiryLines({
      name: d.name, company: d.company, phone: d.phone,
      city: d.city || undefined, product: productSummary, message: d.message || undefined,
    });

    /* Flatten into FormData for PHP */
    const submitData = new FormData();
    submitData.set('name', d.name);
    submitData.set('company', d.company);
    submitData.set('phone', d.phone);
    submitData.set('email', d.email ?? '');
    submitData.set('city', d.city ?? '');
    submitData.set('state', d.state ?? '');
    submitData.set('gstin', d.gstin ?? '');
    submitData.set('buyerType', d.buyerType);
    submitData.set('message', d.message ?? '');
    submitData.set('product', productSummary);
    submitData.set('quantity', String(d.lines[0]?.quantity ?? ''));
    submitData.set('quantityUnit', d.lines[0]?.unit ?? 'pcs');
    submitData.set('_source', 'enquiry-page');

    const res = await postEnquiry(submitData);
    if (res.ok) {
      setState('success');
      trackEnquirySubmit({
        source: 'enquiry-page',
        buyerType: d.buyerType,
        productCount: d.lines.length,
      });
      return;
    }
    if (res.kind === 'validation') {
      setErrors(res.errors);
      setState('idle');
      focusFirstError(form, res.errors);
      return;
    }
    setFallbackLines(summary);
    setRateLimited(res.kind === 'rate-limited');
    setState('error');
  };

  if (state === 'success') {
    return (
      <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-lg) 0' }}>
        <div aria-hidden="true" style={{
          width: 48, height: 48, borderRadius: 'var(--radius-card)',
          background: 'var(--surface-alt)', border: '1px solid var(--grey-warm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: 'var(--success)',
        }}>
          <Check size={24} weight="light" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 125', fontSize: '1.5rem', fontWeight: 650, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Enquiry received.
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--body)', lineHeight: 1.65, maxWidth: '48ch' }}>
          We&rsquo;ll review your requirement and reply within one business day.
          {/* COPY: TODO(client): confirm typical reply time */}
        </p>
        <SuccessNext onLight />
      </div>
    );
  }

  const describe = (key: string, id: string) => (errors[key] ? id : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Full enquiry form"
      className="enq-form"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', minWidth: 0 }}
    >
      <style>{FORM_CSS}</style>

      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Fields marked * are required.</p>

      {/* ── Section 1: Contact ──────────────────────────────────── */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
        <legend style={{
          fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 110',
          fontWeight: 650, fontSize: '1rem', color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
          borderBottom: '1px solid var(--grey-cloud)', paddingBottom: 10, width: '100%',
        }}>
          Contact Information
        </legend>

        <div className="enq-row-2" style={{ rowGap: 'var(--space-md)' }}>
          <div className="enq-field">
            <label htmlFor="fenq-name" style={labelBase}>Name *</label>
            <input id="fenq-name" name="name" type="text" autoComplete="name"
              aria-required="true" placeholder="Your name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describe('name', 'fenq-name-err')}
              style={inputStyle(!!errors.name)} />
            {errors.name && <p id="fenq-name-err" role="alert" style={errBase}>{errors.name}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-company" style={labelBase}>Company *</label>
            <input id="fenq-company" name="company" type="text" autoComplete="organization"
              aria-required="true" placeholder="Company or business name"
              aria-invalid={errors.company ? true : undefined}
              aria-describedby={describe('company', 'fenq-company-err')}
              style={inputStyle(!!errors.company)} />
            {errors.company && <p id="fenq-company-err" role="alert" style={errBase}>{errors.company}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-phone" style={labelBase}>Phone *</label>
            <input id="fenq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel"
              aria-required="true" placeholder="+91 XXXXX XXXXX"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describe('phone', 'fenq-phone-err')}
              style={inputStyle(!!errors.phone)} />
            {errors.phone && <p id="fenq-phone-err" role="alert" style={errBase}>{errors.phone}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-email" style={labelBase}>Email <span style={optStyle}>(optional)</span></label>
            <input id="fenq-email" name="email" type="email" autoComplete="email"
              placeholder="your@email.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describe('email', 'fenq-email-err')}
              style={inputStyle(!!errors.email)} />
            {errors.email && <p id="fenq-email-err" role="alert" style={errBase}>{errors.email}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-city" style={labelBase}>City <span style={optStyle}>(optional)</span></label>
            <input id="fenq-city" name="city" type="text" autoComplete="address-level2"
              placeholder="City"
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={describe('city', 'fenq-city-err')}
              style={inputStyle(!!errors.city)} />
            {errors.city && <p id="fenq-city-err" role="alert" style={errBase}>{errors.city}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-state" style={labelBase}>State <span style={optStyle}>(optional)</span></label>
            <input id="fenq-state" name="state" type="text" autoComplete="address-level1"
              placeholder="State"
              aria-invalid={errors.state ? true : undefined}
              aria-describedby={describe('state', 'fenq-state-err')}
              style={inputStyle(!!errors.state)} />
            {errors.state && <p id="fenq-state-err" role="alert" style={errBase}>{errors.state}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-gstin" style={labelBase}>GSTIN <span style={optStyle}>(optional)</span></label>
            <input id="fenq-gstin" name="gstin" type="text" autoComplete="off"
              placeholder="15-character GSTIN"
              aria-invalid={errors.gstin ? true : undefined}
              aria-describedby={describe('gstin', 'fenq-gstin-err')}
              style={{ ...inputStyle(!!errors.gstin), fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
              maxLength={15}
            />
            {errors.gstin && <p id="fenq-gstin-err" role="alert" style={errBase}>{errors.gstin}</p>}
          </div>
          <div className="enq-field">
            <label htmlFor="fenq-buyer-type" style={labelBase}>I am a *</label>
            <select id="fenq-buyer-type" name="buyerType" aria-required="true" defaultValue=""
              aria-invalid={errors.buyerType ? true : undefined}
              aria-describedby={describe('buyerType', 'fenq-buyer-type-err')}
              style={{ ...inputStyle(!!errors.buyerType), cursor: 'pointer' }}>
              <option value="" disabled>Select&hellip;</option>
              {BUYER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.buyerType && <p id="fenq-buyer-type-err" role="alert" style={errBase}>{errors.buyerType}</p>}
          </div>
        </div>
      </fieldset>

      {/* ── Section 2: Products ─────────────────────────────────── */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
        <legend style={{
          fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 110',
          fontWeight: 650, fontSize: '1rem', color: 'var(--ink)',
          marginBottom: 'var(--space-md)',
          borderBottom: '1px solid var(--grey-cloud)', paddingBottom: 10, width: '100%',
        }}>
          Products Required *
        </legend>

        {errors['lines'] && (
          <p id="fenq-lines-err" role="alert" style={{ ...errBase, marginBottom: 12 }}>{errors['lines']}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {lines.map((line, i) => {
            const pErr = errors[`lines.${i}.product`];
            const qErr = errors[`lines.${i}.quantity`];
            return (
              <div key={i}>
                <div className="enq-line">
                  <div className="enq-line-product enq-field">
                    <label htmlFor={`fenq-line-${i}-product`} style={labelBase}>
                      {i === 0 ? 'Product / Part *' : `Product ${i + 1} *`}
                    </label>
                    <select
                      id={`fenq-line-${i}-product`}
                      value={line.product}
                      onChange={e => updateLine(i, 'product', e.target.value)}
                      aria-required="true"
                      aria-invalid={pErr ? true : undefined}
                      aria-describedby={pErr ? `fenq-line-${i}-product-err` : undefined}
                      style={{ ...inputStyle(!!pErr), cursor: 'pointer' }}
                    >
                      <option value="" disabled>Select product&hellip;</option>
                      {productOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="enq-line-qty enq-field">
                    <label htmlFor={`fenq-line-${i}-qty`} style={labelBase}>Qty</label>
                    <input
                      id={`fenq-line-${i}-qty`}
                      type="number" inputMode="numeric" min="1" max="9999999"
                      value={line.quantity}
                      onChange={e => updateLine(i, 'quantity', e.target.value)}
                      aria-invalid={qErr ? true : undefined}
                      aria-describedby={qErr ? `fenq-line-${i}-qty-err` : undefined}
                      placeholder="e.g. 500"
                      style={inputStyle(!!qErr)}
                    />
                  </div>
                  <div className="enq-line-unit enq-field">
                    <label htmlFor={`fenq-line-${i}-unit`} style={labelBase}>Unit</label>
                    <select
                      id={`fenq-line-${i}-unit`}
                      value={line.unit}
                      onChange={e => updateLine(i, 'unit', e.target.value as 'pcs' | 'sets')}
                      style={{ ...inputStyle(false), cursor: 'pointer' }}
                    >
                      <option value="pcs">Pieces</option>
                      <option value="sets">Sets</option>
                    </select>
                  </div>
                  <div className="enq-line-remove" style={{ alignSelf: 'end' }}>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        aria-label={`Remove product ${i + 1}`}
                        style={{
                          height: 48, width: 48,
                          background: 'none',
                          border: '1px solid var(--grey-warm)',
                          borderRadius: 'var(--radius-card)',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                          fontSize: '1.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
                {pErr && <p id={`fenq-line-${i}-product-err`} role="alert" style={errBase}>{pErr}</p>}
                {qErr && <p id={`fenq-line-${i}-qty-err`} role="alert" style={errBase}>{qErr}</p>}
              </div>
            );
          })}
        </div>

        {lines.length < 10 && (
          <button
            type="button"
            onClick={addLine}
            style={{
              marginTop: 'var(--space-sm)',
              background: 'none',
              border: '1px dashed var(--grey-warm)',
              borderRadius: 'var(--radius-card)',
              padding: '12px 16px', minHeight: 44,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--burgundy)',
              fontWeight: 600,
            }}
          >
            + Add another product
          </button>
        )}

        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 'var(--space-sm)' }}>
          Need a custom part? Pick &ldquo;Custom part / Other&rdquo; and describe it in the notes below.
        </p>
      </fieldset>

      {/* ── Section 3: Message (optional) ───────────────────────── */}
      <div className="enq-field">
        <label htmlFor="fenq-message" style={labelBase}>Additional notes <span style={optStyle}>(optional)</span></label>
        <textarea
          id="fenq-message" name="message" rows={4}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe('message', 'fenq-message-err')}
          style={{ ...inputStyle(!!errors.message), height: 'auto', padding: '12px 14px', resize: 'vertical' }}
          placeholder="Sizes, materials, machine type, urgency, or anything else we should know…"
        />
        {errors.message && <p id="fenq-message-err" role="alert" style={errBase}>{errors.message}</p>}
      </div>

      {/* Honeypot */}
      <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="_source" value="enquiry-page" />

      {state === 'error' && (
        <EnquiryFallback
          summaryLines={fallbackLines}
          onLight
          rateLimited={rateLimited}
          onRetry={() => setState('idle')}
        />
      )}

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="btn btn--primary btn--lg"
          aria-busy={state === 'submitting'}
          style={{ minWidth: 160 }}
        >
          {state === 'submitting' ? 'Sending…' : 'Submit Enquiry →'}
        </button>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.5 }}>
        No spam. Your information is used only to respond to your enquiry.
        We do not share your data with third parties.
      </p>
    </form>
  );
}

/**
 * Shared form constants + scoped CSS for the short and full enquiry forms.
 * Tokens only. No glass effects. 2px radius via --radius-card.
 */

export const BUYER_TYPES = [
  { value: 'oem',             label: 'OEM / Manufacturer' },
  { value: 'dealer',          label: 'Dealer' },
  { value: 'distributor',     label: 'Distributor' },
  { value: 'repair-workshop', label: 'Repair Workshop' },
  { value: 'other',           label: 'Other' },
] as const;

/* Text-presentation arrow (U+2197 + VS15) — avoids emoji boxes on iOS/Android */
export const ARROW_NE = '↗︎';

/**
 * Responsive + focus + on-dark rules. Inline styles cannot express media queries,
 * so these classes carry layout. Injected via <style> by each form.
 */
export const FORM_CSS = `
.enq-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.enq-row-qty { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md); }
.enq-line { display: grid; grid-template-columns: minmax(0,1fr) 110px 100px 48px; gap: var(--space-xs); align-items: end; }
.enq-line > * { min-width: 0; }
@media (max-width: 640px) {
  .enq-row-2 { grid-template-columns: 1fr; }
  .enq-line {
    grid-template-columns: minmax(0,1fr) minmax(0,1fr) 48px;
    grid-template-areas: "product product product" "qty unit remove";
  }
  .enq-line-product { grid-area: product; }
  .enq-line-qty { grid-area: qty; }
  .enq-line-unit { grid-area: unit; }
  .enq-line-remove { grid-area: remove; }
}
.enq-field input:focus-visible,
.enq-field select:focus-visible,
.enq-field textarea:focus-visible,
.enq-form button:focus-visible,
.enq-form a:focus-visible {
  outline: 2px solid var(--burgundy-bright);
  outline-offset: 2px;
}
.enq-dark .enq-field input:focus-visible,
.enq-dark .enq-field select:focus-visible,
.enq-dark .enq-field textarea:focus-visible,
.enq-dark button:focus-visible,
.enq-dark a:focus-visible {
  outline-color: var(--rose-pale);
}
.enq-dark input::placeholder,
.enq-dark textarea::placeholder { color: rgba(255,255,255,0.65); }
.enq-dark option { color: var(--ink); background: var(--surface); }
.enq-form input::placeholder,
.enq-form textarea::placeholder { opacity: 1; }
`;

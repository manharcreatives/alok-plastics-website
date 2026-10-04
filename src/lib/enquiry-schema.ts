/**
 * Enquiry validation schemas — shared by all form components.
 * Server-side (PHP) mirrors these rules.
 * Written for Zod v4 API (issues instead of errors; no required_error shorthand).
 */

import { z } from 'zod';

/* ── Shared field definitions ─────────────────────────────────── */

/* NOTE: .trim() comes first so whitespace-only input fails the min() check. */
export const nameField = z
  .string()
  .trim()
  .min(2, 'Enter your name (at least 2 characters).')
  .max(80, 'Name must be under 80 characters.');

const companyField = z
  .string()
  .trim()
  .min(2, 'Enter your company name (at least 2 characters).')
  .max(100, 'Company name must be under 100 characters.');

export const phoneField = z
  .string()
  .trim()
  .refine(
    val => /^[0-9+\-\s()]+$/.test(val) && val.replace(/\D/g, '').length >= 7 && val.replace(/\D/g, '').length <= 15,
    'Enter a valid phone number (7\u201315 digits).',
  );

const emailField = z
  .string()
  .trim()
  .email('Enter a valid email address.')
  .max(120, 'Email must be under 120 characters.')
  .optional()
  .or(z.literal(''));

/* Additional notes are OPTIONAL — product + contact details are enough to quote. */
export const messageField = z
  .string()
  .trim()
  .max(2000, 'Notes must be under 2000 characters.')
  .optional()
  .or(z.literal(''));

const buyerTypeField = z.enum(
  ['oem', 'dealer', 'distributor', 'repair-workshop', 'other'],
  'Please tell us who you are.',
);

/* GSTIN validation — §14.2 */
const gstinField = z
  .string()
  .trim()
  .regex(
    /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    'Enter a valid 15-character GSTIN.',
  )
  .optional()
  .or(z.literal(''));

/* ── Short form — home page / section band ─────────────────────── */

export const shortEnquirySchema = z.object({
  name:         nameField,
  company:      companyField,
  phone:        phoneField,
  product:      z.string().trim().min(1, 'Please select or describe the product.').max(120),
  quantity:     z.coerce.number('Enter a quantity as a number.').int('Quantity must be a whole number.').min(1, 'Quantity must be at least 1.').max(9_999_999, 'Quantity is too large.').optional(),
  quantityUnit: z.enum(['pcs', 'sets']).default('pcs'),
  message:      messageField,
  buyerType:    buyerTypeField.optional(),
  _honey:       z.literal('').optional(),
  _source:      z.string().max(40).optional(),
});

export type ShortEnquiryData = z.infer<typeof shortEnquirySchema>;

/* ── Full bulk form — /enquiry page ────────────────────────────── */

export const lineItemSchema = z.object({
  product:  z.string().trim().min(1, 'Select a product.').max(120),
  quantity: z.coerce.number('Enter a quantity as a number.').int('Quantity must be a whole number.').min(1, 'Quantity must be at least 1.').max(9_999_999, 'Quantity is too large.').optional(),
  unit:     z.enum(['pcs', 'sets']).default('pcs'),
});

export const fullEnquirySchema = z.object({
  name:      nameField,
  company:   companyField,
  phone:     phoneField,
  email:     emailField,
  city:      z.string().trim().min(2, 'City must be at least 2 characters.').max(60).optional().or(z.literal('')),
  state:     z.string().trim().min(2, 'State must be at least 2 characters.').max(60).optional().or(z.literal('')),
  gstin:     gstinField,
  buyerType: buyerTypeField,
  lines:     z.array(lineItemSchema).min(1, 'Add at least one product.').max(20),
  message:   messageField,
  _honey:    z.literal('').optional(),
  _source:   z.string().max(40).optional(),
});

export type FullEnquiryData = z.infer<typeof fullEnquirySchema>;

/* ── Helper: format validation issues into a flat record ──────── */

export function flattenZodErrors(
  err: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/* ── Validate a FormData object against the short schema ─────── */

export function validateShortForm(data: FormData): {
  ok: boolean;
  data?: ShortEnquiryData;
  errors?: Record<string, string>;
} {
  const raw = {
    name:         data.get('name'),
    company:      data.get('company'),
    phone:        data.get('phone'),
    product:      data.get('product'),
    quantity:     data.get('quantity') || undefined,
    quantityUnit: data.get('quantityUnit') || 'pcs',
    message:      data.get('message') ?? '',
    buyerType:    data.get('buyerType') || undefined,
    _honey:       data.get('_honey') || undefined,
    _source:      data.get('_source') || undefined,
  };
  const result = shortEnquirySchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, errors: flattenZodErrors(result.error) };
}

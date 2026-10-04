/**
 * WhatsApp deep link helpers — single source for all WA links in the site.
 *
 * Every helper takes an optional `number`. Pass the value from `useRuntimeContact()`
 * and the link follows whatever the owner last saved in the panel; omit it and the
 * link reads the build-time value in `site.contact`. Either way the number is reduced
 * to digits here, because `wa.me` wants the country code and nothing else.
 *
 * Functions return null when no number is configured — the caller renders nothing.
 * §14 spec: WhatsApp is the primary channel — must work even if email fails.
 */

import { site } from '@/content/site';

/* Strip non-digit characters from a phone number string */
function digits(n: string): string {
  return n.replace(/\D/g, '');
}

/** Base WhatsApp link with an encoded message */
export function waLink(message: string, number?: string | null): string | null {
  const src = number || site.contact.whatsapp;
  if (!src) return null;
  return `https://wa.me/${digits(src)}?text=${encodeURIComponent(message)}`;
}

/** Generic enquiry — home hero / FAB */
export function waGeneral(number?: string | null): string | null {
  return waLink(
    'Hello Alok Plastics! I would like to enquire about spare parts.',
    number,
  );
}

/** Product-specific enquiry — product detail / card CTAs */
export function waProduct(opts: {
  productName: string;
  variant?: string;
  quantity?: number;
  unit?: 'pcs' | 'sets';
  buyerName?: string;
  city?: string;
}, number?: string | null): string | null {
  const { productName, variant, quantity, unit, buyerName, city } = opts;
  const lines: string[] = [
    `Hello Alok Plastics! I'd like a quote for:`,
    `• Product: ${productName}${variant ? ` (${variant})` : ''}`,
  ];
  if (quantity) {
    lines.push(`• Qty: ${quantity} ${unit ?? 'pcs'}`);
  }
  if (buyerName) lines.push(`• Name: ${buyerName}`);
  if (city) lines.push(`• City: ${city}`);
  return waLink(lines.join('\n'), number);
}

/** Enquiry follow-up — used by both forms after a successful send */
export function waFromShortForm(opts: {
  name: string;
  company: string;
  product: string;
  quantity?: number;
  unit?: 'pcs' | 'sets';
  message?: string;
}, number?: string | null): string | null {
  return waLink(enquiryLines(opts).join('\n'), number);
}

/** Plain summary lines shared by WhatsApp and mailto fallbacks */
export function enquiryLines(opts: {
  name: string;
  company: string;
  phone?: string;
  city?: string;
  product: string;
  quantity?: number;
  unit?: 'pcs' | 'sets';
  message?: string;
}): string[] {
  const { name, company, phone, city, product, quantity, unit, message } = opts;
  const lines: string[] = [
    `\u2022 Name: ${name}`,
    `\u2022 Company: ${company}`,
  ];
  if (phone) lines.push(`\u2022 Phone: ${phone}`);
  if (city) lines.push(`\u2022 City: ${city}`);
  lines.push(`\u2022 Product: ${product}`);
  if (quantity) lines.push(`\u2022 Qty: ${quantity} ${unit ?? 'pcs'}`);
  if (message) lines.push(`\u2022 Note: ${message}`);
  return lines;
}

/** Formatted WA number for display (e.g. "+91 98765 43210") */
export function waDisplayNumber(number?: string | null): string | null {
  return number || site.contact.whatsapp;
}

/* ── Order request (cart -> WhatsApp). No payment, nothing is confirmed here. ── */

export interface OrderLine {
  name: string;
  sku?: string | null;
  qty: number;
  /** INR from the admin, or null => "Price on request". Never guessed. */
  price: number | null;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  /** Delivery address / city */
  address: string;
  message?: string;
}

const inr = (n: number) => `\u20B9${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

/** The structured order-request text (also used by the copy-message fallback). */
export function orderMessage(lines: OrderLine[], customer: OrderCustomer): string {
  const out: string[] = ['ORDER REQUEST - Alok Plastics', ''];
  lines.forEach((l, i) => {
    out.push(`${i + 1}. ${l.name}`);
    if (l.sku) out.push(`   SKU: ${l.sku}`);
    out.push(`   Qty: ${l.qty}`);
    out.push(`   Price: ${l.price === null ? 'Price on request' : `${inr(l.price)} each`}`);
  });
  /* Only when EVERY line has a price; a partial sum would be a made-up number. */
  if (lines.length > 0 && lines.every(l => l.price !== null)) {
    const total = lines.reduce((s, l) => s + (l.price as number) * l.qty, 0);
    out.push('', `Estimated total: ${inr(total)} (final price to be confirmed)`);
  }
  out.push('', 'Customer details', `Name: ${customer.name}`, `Phone: ${customer.phone}`, `Delivery address / city: ${customer.address}`);
  if (customer.message?.trim()) out.push('', `Message: ${customer.message.trim()}`);
  out.push('', 'Please confirm availability, final price and delivery.');
  return out.join('\n');
}

/** WhatsApp link for the order request, or null when no number is configured. */
export function waOrder(lines: OrderLine[], customer: OrderCustomer, number?: string | null): string | null {
  return waLink(orderMessage(lines, customer), number);
}

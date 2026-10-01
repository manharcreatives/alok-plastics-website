/**
 * WhatsApp deep link helpers — single source for all WA links in the site.
 * All links read site.contact.whatsapp at call time.
 * Functions return null when the number is not configured.
 * §14 spec: WhatsApp is the primary channel — must work even if email fails.
 */

import { site } from '@/content/site';

/* Strip non-digit characters from a phone number string */
function digits(n: string): string {
  return n.replace(/\D/g, '');
}

/** Base WhatsApp link with an encoded message */
export function waLink(message: string): string | null {
  if (!site.contact.whatsapp) return null;
  const num = digits(site.contact.whatsapp);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** Generic enquiry — home hero / FAB */
export function waGeneral(): string | null {
  return waLink(
    'Hello Alok Plastics! I would like to enquire about spare parts.',
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
}): string | null {
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
  return waLink(lines.join('\n'));
}

/** Enquiry follow-up — used by both forms after a successful send */
export function waFromShortForm(opts: {
  name: string;
  company: string;
  product: string;
  quantity?: number;
  unit?: 'pcs' | 'sets';
  message?: string;
}): string | null {
  return waLink(enquiryLines(opts).join('\n'));
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
export function waDisplayNumber(): string | null {
  if (!site.contact.whatsapp) return null;
  return site.contact.whatsapp;
}

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import type { PdfPayload } from './collection';
import type { Business } from './kv';

/* GST invoice / proforma on a fixed A4 template. Ported from api/lib/proforma.php: the layout is drawn in a
   759 x 1039 design grid ("px") mapped onto the page in millimetres, so every coordinate below is the original. */

const OX = 6;
const OY = 6;
const SX = 198 / 759;
const SY = 285 / 1039;
const MM = 72 / 25.4; // millimetres -> PDF points
const PAGE_H_MM = 297;
const LINE_W = 0.38;

type Style = '' | 'B' | 'I' | 'BI';
type Align = 'L' | 'C' | 'R';

export type InvoiceDoc = PdfPayload & { no: string; date: string; reverse_charge?: string };

/** Standard PDF fonts only cover WinAnsi: swap typographic characters and drop anything else. */
export function pdfText(input: unknown): string {
  const map: Record<string, string> = { '₹': 'Rs.', '–': '-', '—': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '×': 'x', '•': '*', '…': '...', ' ': ' ' };
  let out = '';
  for (const ch of String(input ?? '')) {
    const c = map[ch] ?? ch;
    for (const x of c) {
      const code = x.codePointAt(0) ?? 0;
      if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) out += x;
    }
  }
  return out;
}

export const inr = (n: number): string => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function rupeesInWords(n: number): string {
  if (n <= 0) return '';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (x: number): string => (x < 20 ? a[x]! : b[Math.floor(x / 10)]! + (x % 10 ? ` ${a[x % 10]}` : ''));
  const three = (x: number): string => (x > 99 ? `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ' ' : ''}` : '') + (x % 100 ? two(x % 100) : '');
  let s = '';
  let rest = n;
  for (const [v, label] of [[10_000_000, 'Crore'], [100_000, 'Lakh'], [1000, 'Thousand']] as const) {
    const q = Math.floor(rest / v);
    if (q > 0) {
      s += `${q > 99 ? three(q) : two(q)} ${label} `;
      rest %= v;
    }
  }
  if (rest > 0) s += `${three(rest)} `;
  return `${s.trim()} Rupees Only`;
}

export type Totals = { sub: number; taxes: [string, number][]; raw: number; grand: number; round: number; priced: boolean; rate: number; mode: 'intra' | 'inter' | 'ut' };

export function invoiceTotals(d: Pick<PdfPayload, 'items' | 'mode' | 'rate'>, withTax: boolean): Totals {
  let sub = 0;
  let priced = true;
  let count = 0;
  for (const it of d.items) {
    count++;
    if (it.price === null || !Number.isFinite(Number(it.price))) { priced = false; continue; }
    sub += Number(it.price) * Number(it.qty || 0);
  }
  sub = Math.round(sub * 100) / 100;
  const mode = ['intra', 'inter', 'ut'].includes(d.mode) ? d.mode : 'ut';
  const rate = Math.max(0, Number(d.rate ?? 18));
  const taxes: [string, number][] = [];
  if (withTax) {
    if (mode === 'inter') taxes.push(['Add IGST', Math.round(sub * rate) / 100]);
    else {
      const half = Math.round(sub * rate * 100 / 200) / 100;
      taxes.push([mode === 'intra' ? 'Add SGST' : 'Add UTGST', half], ['Add CGST', half]);
    }
  }
  const raw = taxes.reduce((s, t) => s + t[1], sub);
  const grand = Math.round(raw);
  return { sub, taxes, raw, grand, round: grand - raw, priced: priced && count > 0, rate, mode };
}

class Sheet {
  page!: PDFPage;
  constructor(private pdf: PDFDocument, private f: Record<Style, PDFFont>) {}

  newPage(): void {
    this.page = this.pdf.addPage([210 * MM, PAGE_H_MM * MM]);
  }

  px = (x: number): number => OX + x * SX;
  py = (y: number): number => OY + y * SY;
  pw = (w: number): number => w * SX;
  ph = (h: number): number => h * SY;
  pt = (sizePx: number): number => sizePx * SX * 2.835;

  font(style: Style): PDFFont { return this.f[style]; }
  /** Width in mm of text at a size in points. */
  width(text: string, sizePt: number, style: Style = ''): number { return (this.f[style].widthOfTextAtSize(text, sizePt) * 25.4) / 72; }

  fit(text: string, wMm: number, sizePt: number, style: Style, minPt = 6): number {
    let s = sizePt;
    while (s > minPt && this.width(text, s, style) > wMm) s -= 0.25;
    return s;
  }

  /** Text in a (x, y, w, h) cell, vertically centred like FPDF's Cell, shrunk to fit its width. Coordinates in design px. */
  put(x: number, y: number, w: number, h: number, raw: string, sizePx: number, style: Style = '', align: Align = 'L'): void {
    this.cell(this.px(x), this.py(y), this.pw(w), this.ph(h), pdfText(raw), this.pt(sizePx), style, align);
  }

  /** Same, in millimetres and a fixed point size. */
  cell(xMm: number, yMm: number, wMm: number, hMm: number, text: string, sizePt: number, style: Style, align: Align, fit = true): void {
    if (text === '') return;
    const size = fit ? this.fit(text, wMm, sizePt, style) : sizePt;
    const tw = this.width(text, size, style);
    const x = align === 'R' ? xMm + wMm - tw : align === 'C' ? xMm + (wMm - tw) / 2 : xMm;
    const sizeMm = (size * 25.4) / 72;
    const baseline = yMm + hMm / 2 + 0.3 * sizeMm;
    this.page.drawText(text, { x: x * MM, y: (PAGE_H_MM - baseline) * MM, size, font: this.f[style] });
  }

  line(x1: number, y1: number, x2: number, y2: number, widthMm = LINE_W, dash?: number[]): void {
    this.page.drawLine({
      start: { x: x1 * MM, y: (PAGE_H_MM - y1) * MM },
      end: { x: x2 * MM, y: (PAGE_H_MM - y2) * MM },
      thickness: widthMm * MM,
      ...(dash ? { dashArray: dash.map((d) => d * MM) } : {}),
    });
  }
  vline(x: number, y1: number, y2: number): void { this.line(this.px(x), this.py(y1), this.px(x), this.py(y2)); }
  hline(x1: number, x2: number, y: number): void { this.line(this.px(x1), this.py(y), this.px(x2), this.py(y)); }
  dotted(x1: number, x2: number, y: number): void { this.line(this.px(x1), this.py(y), this.px(x2), this.py(y), 0.2, [0.35, 0.7]); }

  rect(xMm: number, yMm: number, wMm: number, hMm: number, widthMm = LINE_W): void {
    this.page.drawRectangle({ x: xMm * MM, y: (PAGE_H_MM - yMm - hMm) * MM, width: wMm * MM, height: hMm * MM, borderWidth: widthMm * MM, borderColor: rgb(0, 0, 0), opacity: 0, borderOpacity: 1 });
  }

  /** Greedy word wrap with the given font size; words longer than the width are cut. */
  wrap(text: string, wMm: number, sizePt: number, style: Style = '', maxLines = 0): string[] {
    const lines: string[] = [];
    let cur = '';
    for (const word of text.trim().split(/\s+/)) {
      if (word === '') continue;
      const attempt = cur === '' ? word : `${cur} ${word}`;
      if (this.width(attempt, sizePt, style) <= wMm) { cur = attempt; continue; }
      if (cur !== '') lines.push(cur);
      cur = word;
      while (this.width(cur, sizePt, style) > wMm && cur.length > 1) {
        let cut = cur.length - 1;
        while (cut > 1 && this.width(cur.slice(0, cut), sizePt, style) > wMm) cut--;
        lines.push(cur.slice(0, cut));
        cur = cur.slice(cut);
      }
    }
    if (cur !== '') lines.push(cur);
    return maxLines > 0 ? lines.slice(0, maxLines) : lines;
  }
}

function frame(p: Sheet, b: Business, d: InvoiceDoc, isInvoice: boolean): void {
  const cust = d.customer;
  const tr = d.transport;
  p.rect(p.px(0), p.py(0), p.pw(759), p.ph(1039));
  if (isInvoice) p.put(14, 11, 220, 20, `GSTIN : ${b.gstin}`, 14, 'B');
  const title = isInvoice ? 'GST INVOICE' : 'PROFORMA INVOICE';
  p.put(0, 9, 759, 24, title, 17, 'B', 'C');
  const tw = p.width(title, p.fit(title, p.pw(759), p.pt(17), 'B'), 'B');
  p.line(p.px(759 / 2) - tw / 2, p.py(31), p.px(759 / 2) + tw / 2, p.py(31));
  p.rect(p.px(631), p.py(12), p.pw(13), p.ph(23), 0.3);
  p.rect(p.px(634), p.py(16), p.pw(7), p.ph(8), 0.3);
  p.line(p.px(634), p.py(27), p.px(641), p.py(27), 0.3);
  p.line(p.px(634), p.py(30), p.px(641), p.py(30), 0.3);
  b.phones.slice(0, 2).forEach((ph, i) => p.put(651, 9 + i * 21, 108, 21, ph, 18));
  p.put(0, 36, 759, 62, b.name, 52, 'B', 'C');
  b.tagline.slice(0, 2).forEach((line, i) => p.put(0, 96 + i * 16, 759, 20, line, 16, '', 'C'));
  p.put(0, 133, 759, 24, b.address.join(', '), 19, 'B', 'C');
  p.put(16, 169, 50, 22, 'Date :', 15);
  p.put(62, 169, 136, 22, d.date, 15);
  p.dotted(62, 198, 191);
  const no = pdfText(d.no);
  const nw = Math.min(330, p.width(no, p.pt(22), 'B') / SX + 4);
  p.put(750 - nw - 100, 172, 100, 24, isInvoice ? 'Invoice No. :' : 'Proforma No. :', 15, '', 'R');
  p.put(750 - nw, 170, nw, 28, no, 22, 'B', 'R');
  p.put(16, 206, 40, 24, 'M/s.', 15);
  const mob = (cust.phone ?? '').trim().replace(/^\+?91(?=\d{10}$)/, '');
  p.put(50, 204, mob !== '' ? 520 : 690, 24, cust.name ?? '', 15, 'B');
  if (mob !== '') p.put(580, 206, 163, 22, `Mob. : ${mob}`, 14, '', 'R');
  p.dotted(50, 743, 229);
  p.wrap(pdfText(cust.address ?? ''), p.pw(720), p.pt(14), '', 2).forEach((line, i) => p.put(16, 233 + i * 15, 727, 15, line, 14));
  p.dotted(16, 743, 262);
  const gstin = (cust.gstin ?? '').trim().toUpperCase();
  const state = (cust.state ?? '').trim();
  const code = /^\d{2}/.test(gstin) ? gstin.slice(0, 2) : '';
  p.put(16, 268, 100, 22, 'PARTY GSTIN', 15);
  p.put(124, 268, 194, 22, gstin, 14);
  p.dotted(117, 318, 289);
  p.put(326, 268, 44, 22, 'State', 15);
  p.put(370, 268, 160, 22, state, 14);
  p.dotted(370, 530, 289);
  p.put(536, 268, 80, 22, 'State Code', 15);
  p.put(618, 268, 125, 22, code, 14);
  p.dotted(618, 743, 289);
  p.put(16, 300, 74, 22, 'Transport', 15);
  p.put(90, 300, 215, 22, tr.transporter ?? '', 14);
  p.dotted(90, 305, 321);
  p.put(312, 300, 70, 22, 'G.R. No.', 15);
  p.put(382, 300, 170, 22, tr.gr_no ?? '', 14);
  p.dotted(382, 556, 321);
  p.put(562, 300, 28, 22, 'Dt.', 15);
  p.put(590, 300, 153, 22, tr.gr_dt ?? '', 14);
  p.dotted(590, 743, 321);
  p.hline(0, 759, 329);
  for (const x of [33, 438, 507, 565, 644]) p.vline(x, 329, 777);
  p.hline(0, 759, 367);
  p.put(0, 332, 33, 15, 'S.', 15, '', 'C');
  p.put(0, 346, 33, 15, 'No.', 15, '', 'C');
  p.put(33, 329, 405, 38, 'DESCRIPTION OF GOODS', 15, '', 'C');
  p.put(438, 329, 69, 38, 'HSN ACS', 14, '', 'C');
  p.put(507, 329, 58, 38, 'Qty.', 15, '', 'C');
  p.put(565, 329, 79, 38, 'RATE', 15, '', 'C');
  p.put(644, 329, 115, 38, 'AMOUNT', 15, '', 'C');
  p.put(13, 937, 100, 16, 'E. & O. E.', 12, 'B');
  b.terms.slice(0, 3).forEach((t, i) => p.put(13, 953 + i * 14.5, 440, 14.5, t, 12));
  const nameW = p.width(pdfText(b.name), p.pt(19), 'B') / SX;
  p.put(750 - nameW - 34, 966, 28, 28, 'For', 14, 'BI', 'R');
  p.put(750 - nameW - 2, 964, nameW + 2, 30, b.name, 19, 'B', 'R');
  p.put(13, 1006, 360, 20, b.copies, 15);
  p.put(383, 1008, 180, 20, "Customer's Signatory", 13.5);
  p.put(570, 1008, 180, 20, 'Authorised Signatory', 13.5, '', 'R');
}

function bottom(p: Sheet, b: Business, d: InvoiceDoc, t: Totals, isInvoice: boolean, qr: PDFImage | null): void {
  const top = 777;
  p.hline(0, 759, top);
  p.vline(463, top, top + 188);
  const words = t.priced || isInvoice ? rupeesInWords(t.grand) : '';
  const labelW = p.width('Rupees in Words', p.pt(14)) / SX + 6;
  p.put(16, top + 19, labelW, 22, 'Rupees in Words', 14);
  let size = 14;
  let l1 = '';
  let l2 = '';
  if (words !== '') {
    for (; size >= 8; size -= 0.5) {
      l1 = p.wrap(words, p.pw(463 - 25 - labelW), p.pt(size))[0] ?? '';
      const second = p.wrap(words.slice(l1.length).trim(), p.pw(438), p.pt(size));
      l2 = second[0] ?? '';
      if (second.length <= 1) break;
    }
  }
  p.put(16 + labelW, top + 19, 463 - 25 - labelW, 22, l1, size);
  p.dotted(16 + labelW, 454, top + 40);
  p.put(16, top + 53, 438, 22, l2, size);
  p.dotted(16, 454, top + 74);
  p.hline(0, 463, top + 81);
  b.bank.slice(0, 5).forEach((line, i) => p.put(13, top + 84 + i * 16.5, 360, 16.5, line, 14, i === 0 ? 'B' : ''));
  if (qr) {
    const h = 72;
    const w = (h * qr.width) / qr.height;
    p.page.drawImage(qr, { x: p.px(454 - w) * MM, y: (PAGE_H_MM - p.py(top + 84) - p.ph(h)) * MM, width: p.pw(w) * MM, height: p.ph(h) * MM });
  }
  p.hline(0, 463, top + 159);
  let rows: [string, string][] = [['Total Amount before Tax', t.sub > 0 ? inr(t.sub) : '']];
  if (isInvoice) {
    for (const tx of t.taxes) rows.push([tx[0], tx[1] > 0 ? inr(tx[1]) : '']);
    rows.push(['ROUND OFF :', t.sub > 0 ? (t.round >= 0 ? '+' : '-') + inr(Math.abs(t.round)) : '']);
    rows.push(['GRAND TOTAL :', t.sub > 0 ? inr(t.grand) : '']);
  } else {
    rows = [['Total (before GST)', t.priced ? inr(t.sub) : t.sub > 0 ? `${inr(t.sub)} + on request` : 'Price on request']];
  }
  const rowH = isInvoice ? Math.min(36, 162 / rows.length) : 27;
  let y = top;
  rows.forEach(([label, val], i) => {
    const bold = isInvoice && i === rows.length - 1;
    p.put(463 + 12, y, 166, rowH, label, 14.5, bold ? 'B' : '');
    p.put(463 + 185, y, 296 - 185 - 8, rowH, val, 14.5, bold ? 'B' : '', 'R');
    y += rowH;
    p.hline(463, 759, y);
  });
  p.vline(463 + 181, top, y);
  if (isInvoice) {
    p.put(463 + 12, top + 162, 296 - 12, 26, `GST Payable on Reverse Charge : ${d.reverse_charge ?? 'No'}`, 14);
  } else {
    p.wrap(pdfText(b.proforma_note), p.pw(296 - 24), p.pt(11), 'I', 6).forEach((line, i) => p.put(463 + 12, y + 8 + i * 15, 296 - 20, 15, line, 11, 'I'));
  }
}

type Row = { sn: string; lines: string[]; hsn: string; qty: string; rate: string; amt: string; h: number; note?: boolean };

export async function buildInvoicePdf(d: InvoiceDoc, type: 'invoice' | 'proforma', b: Business): Promise<Uint8Array> {
  const isInvoice = type !== 'proforma';
  const t = invoiceTotals(d, isInvoice);
  const pdf = await PDFDocument.create();
  pdf.setTitle(isInvoice ? 'GST Invoice' : 'Proforma Invoice');
  pdf.setAuthor('Alok Plastics');
  pdf.setCreator('Alok Plastics');
  const f: Record<Style, PDFFont> = {
    '': await pdf.embedFont(StandardFonts.Helvetica),
    B: await pdf.embedFont(StandardFonts.HelveticaBold),
    I: await pdf.embedFont(StandardFonts.HelveticaOblique),
    BI: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
  };
  let qr: PDFImage | null = null;
  try {
    qr = await pdf.embedPng(await readFile(join(process.cwd(), 'public', 'brand', 'upiqr.png')));
  } catch {
    qr = null; // no QR file: the PDF simply has none
  }
  const p = new Sheet(pdf, f);
  p.newPage();
  const descW = p.pw(405) - 2.4;
  const bodyH = p.ph(777 - 367);
  const lineH = 4.2;

  const rows: Row[] = d.items.map((it, i) => {
    const lines = p.wrap(pdfText(it.name), descW, p.pt(14));
    const qty = Number(it.qty || 0);
    const has = it.price !== null && Number.isFinite(Number(it.price));
    const price = has ? Number(it.price) : 0;
    return {
      sn: String(i + 1),
      lines: lines.length ? lines : [''],
      hsn: it.hsn ?? '',
      qty: `${Number(qty.toFixed(3))} ${it.unit ?? ''}`.trim(),
      rate: has ? inr(price) : '-',
      amt: has ? inr(price * qty) : 'On request',
      h: Math.max(p.ph(22), Math.max(1, lines.length) * lineH + 1.8),
    };
  });
  const note = (d.note ?? '').trim();
  if (note !== '') {
    const noteLines = p.wrap(pdfText(`Note: ${note}`), descW, p.pt(13), 'I', 3);
    rows.push({ sn: '', lines: noteLines, hsn: '', qty: '', rate: '', amt: '', h: noteLines.length * lineH + 4, note: true });
  }

  const pages: Row[][] = [[]];
  let used = 0;
  for (const r of rows) {
    if (used + r.h > bodyH && pages[pages.length - 1]!.length > 0) { pages.push([]); used = 0; }
    pages[pages.length - 1]!.push(r);
    used += r.h;
  }

  pages.forEach((chunk, pi) => {
    if (pi > 0) p.newPage();
    frame(p, b, d, isInvoice);
    let y = p.py(367);
    for (const r of chunk) {
      const style: Style = r.note ? 'I' : '';
      const size = p.pt(r.note ? 13 : 14);
      p.cell(p.px(0), y + (r.h - lineH) / 2, p.pw(33), lineH, r.sn, size, style, 'C');
      const ly = y + (r.h - r.lines.length * lineH) / 2;
      r.lines.forEach((line, li) => p.cell(p.px(33) + 1.2, ly + li * lineH, descW, lineH, line, size, style, 'L', false));
      for (const [cx, cw, txt, al] of [[438, 69, r.hsn, 'C'], [507, 58, r.qty, 'R'], [565, 79, r.rate, 'R'], [644, 115, r.amt, 'R']] as const) {
        p.cell(p.px(cx) + 1.2, y + (r.h - lineH) / 2, p.pw(cw) - 2.4, lineH, pdfText(txt), p.pt(14), '', al);
      }
      y += r.h;
    }
    if (pi === pages.length - 1) bottom(p, b, d, t, isInvoice, qr);
    else {
      p.hline(0, 759, 777);
      p.put(13, 777 + 80, 440, 20, 'Continued on next page...', 14, 'I');
    }
  });
  return pdf.save();
}

export function pdfFileName(type: 'invoice' | 'proforma', no: string): string {
  return `${type === 'invoice' ? 'Invoice-' : 'Proforma-'}${no.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}.pdf`;
}

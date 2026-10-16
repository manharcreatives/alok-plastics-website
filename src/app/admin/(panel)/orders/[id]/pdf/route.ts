import type { NextRequest } from 'next/server';
import { audit, currentAdmin } from '@/server/admin-auth';
import { buildInvoicePdf, pdfFileName } from '@/server/invoice-pdf';
import { getOrder } from '@/server/orders-admin';
import { getBusiness } from '@/server/kv';

/* GET /admin/orders/<id>/pdf/?n=<index>[&dl=1] : renders a stored proforma / GST invoice. Admin session required. */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentAdmin();
  if (!user) return new Response('Sign in required', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const { id } = await ctx.params;
  const o = await getOrder(id);
  const n = Number(req.nextUrl.searchParams.get('n'));
  const e = o && Number.isInteger(n) ? (o.pdfs ?? [])[n] : undefined;
  if (!o || !e) return new Response('That PDF is not stored on this order.', { status: 404 });
  const bytes = await buildInvoicePdf({ ...e.payload, no: e.no, date: e.date }, e.type, await getBusiness());
  const dl = req.nextUrl.searchParams.has('dl');
  if (dl) await audit(user.username, 'order_pdf_download', o.code, e.no);
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${dl ? 'attachment' : 'inline'}; filename="${pdfFileName(e.type, e.no)}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

import { audit, currentAdmin } from '@/server/admin-auth';
import { applications } from '@/server/collection';
import { getFile } from '@/server/files';

/* GET /admin/applications/<id>/resume/ : download the stored resume. Admin session required. */

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await currentAdmin();
  if (!user) return new Response('Sign in required', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const { id } = await ctx.params;
  const a = await applications().find(Number(id));
  const f = a?.resume_file ? await getFile(a.resume_file, 'resume') : null;
  if (!a || !f) return new Response('No resume file is stored for this application.', { status: 404 });
  const safe = (a.resume_name || f.name || 'resume').replace(/[^A-Za-z0-9._ -]/g, '_');
  await audit(user.username, 'resume_download', `#${a.id}`, safe);
  return new Response(new Uint8Array(f.data), {
    headers: {
      'Content-Type': f.mime,
      'Content-Disposition': `attachment; filename="${safe}"`,
      'Content-Length': String(f.data.length),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

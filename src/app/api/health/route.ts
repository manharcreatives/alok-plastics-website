import { query } from '@/server/db';
import { respond } from '@/server/http';

/** GET /api/health/ : confirms the function runs and Neon answers. Reveals nothing else. */
export async function GET() {
  try {
    await query('select 1');
    return respond(200, { ok: true, db: true, script: (process.env.SCRIPT_URL ?? '').slice(35, 43) || null }); // TEMP diagnostic
  } catch {
    return respond(503, { ok: false, db: false });
  }
}

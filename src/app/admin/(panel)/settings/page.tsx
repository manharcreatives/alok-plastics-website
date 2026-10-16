import { Flash, PageHead } from '@/components/admin/ui';
import { requireAdmin } from '@/server/admin-auth';
import { HOURS_KEYS } from '@/server/content';
import { kvGet } from '@/server/kv';
import { changePassword, saveSettings } from './actions';

export const metadata = { title: 'Settings' };

type Props = { searchParams: Promise<{ ok?: string; err?: string }> };
type Settings = {
  contact?: { phone?: string | null; whatsapp?: string | null; email?: string | null; mapsUrl?: string | null; gstin?: string | null };
  social?: { instagram?: string | null; linkedin?: string | null; facebook?: string | null; youtube?: string | null };
  replyTime?: string | null;
  hours?: Record<string, { closed?: boolean; open?: string; close?: string }>;
  hoursNote?: string | null;
  banner?: { enabled?: boolean; text?: string; href?: string | null };
};

const DAY: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

export default async function SettingsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const s = (await kvGet<Settings>('settings')) ?? {};
  const c = s.contact ?? {};
  const so = s.social ?? {};
  const b = s.banner ?? {};
  return (
    <>
      <PageHead
        title="Site settings"
        crumbs={[['Dashboard', '/admin/'], ['Settings', null]]}
        lead="Contact details, opening hours and the announcement bar shown on the website. Blank fields fall back to the built-in values."
      />
      <Flash ok={sp.ok} err={sp.err} />

      <form action={saveSettings}>
        <section className="card" aria-labelledby="h-contact">
          <div className="card-head"><h2 className="card-title" id="h-contact">Contact</h2></div>
          <div className="form-grid">
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="text" maxLength={40} defaultValue={c.phone ?? ''} /></div>
            <div className="field"><label htmlFor="whatsapp">WhatsApp number</label><input id="whatsapp" name="whatsapp" type="text" maxLength={40} defaultValue={c.whatsapp ?? ''} /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="text" maxLength={120} defaultValue={c.email ?? ''} /></div>
            <div className="field"><label htmlFor="gstin">GSTIN</label><input id="gstin" name="gstin" type="text" maxLength={20} defaultValue={c.gstin ?? ''} /></div>
            <div className="field field-wide"><label htmlFor="mapsUrl">Google Maps link</label><input id="mapsUrl" name="mapsUrl" type="text" maxLength={300} defaultValue={c.mapsUrl ?? ''} /></div>
            <div className="field field-wide"><label htmlFor="replyTime">Typical reply time</label><input id="replyTime" name="replyTime" type="text" maxLength={120} defaultValue={s.replyTime ?? ''} placeholder="We reply within one business day" /></div>
          </div>
        </section>

        <section className="card" aria-labelledby="h-social">
          <div className="card-head"><h2 className="card-title" id="h-social">Social links</h2></div>
          <div className="form-grid">
            <div className="field"><label htmlFor="instagram">Instagram</label><input id="instagram" name="instagram" type="text" maxLength={300} defaultValue={so.instagram ?? ''} /></div>
            <div className="field"><label htmlFor="linkedin">LinkedIn</label><input id="linkedin" name="linkedin" type="text" maxLength={300} defaultValue={so.linkedin ?? ''} /></div>
            <div className="field"><label htmlFor="facebook">Facebook</label><input id="facebook" name="facebook" type="text" maxLength={300} defaultValue={so.facebook ?? ''} /></div>
            <div className="field"><label htmlFor="youtube">YouTube</label><input id="youtube" name="youtube" type="text" maxLength={300} defaultValue={so.youtube ?? ''} /></div>
          </div>
        </section>

        <section className="card" aria-labelledby="h-hours">
          <div className="card-head"><h2 className="card-title" id="h-hours">Opening hours</h2><span className="card-sub">24-hour, like 09:30</span></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th scope="col">Day</th><th scope="col">Closed</th><th scope="col">Opens</th><th scope="col">Closes</th></tr></thead>
              <tbody>
                {HOURS_KEYS.map((d) => (
                  <tr key={d}>
                    <td><span className="cell-main">{DAY[d]}</span></td>
                    <td><input type="checkbox" name={`${d}_closed`} defaultChecked={s.hours?.[d]?.closed ?? false} aria-label={`${DAY[d]} closed`} /></td>
                    <td><input type="text" name={`${d}_open`} maxLength={5} defaultValue={s.hours?.[d]?.open ?? ''} aria-label={`${DAY[d]} opens`} style={{ maxWidth: 110 }} /></td>
                    <td><input type="text" name={`${d}_close`} maxLength={5} defaultValue={s.hours?.[d]?.close ?? ''} aria-label={`${DAY[d]} closes`} style={{ maxWidth: 110 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="field"><label htmlFor="hoursNote">Note under the hours</label><input id="hoursNote" name="hoursNote" type="text" maxLength={200} defaultValue={s.hoursNote ?? ''} /></div>
        </section>

        <section className="card" aria-labelledby="h-banner">
          <div className="card-head"><h2 className="card-title" id="h-banner">Announcement bar</h2></div>
          <label className="switch"><input type="checkbox" name="banner_on" defaultChecked={b.enabled ?? false} /><span>Show the bar at the top of the website</span></label>
          <div className="form-grid">
            <div className="field field-wide"><label htmlFor="banner_text">Text</label><input id="banner_text" name="banner_text" type="text" maxLength={200} defaultValue={b.text ?? ''} /></div>
            <div className="field field-wide"><label htmlFor="banner_href">Link (optional)</label><input id="banner_href" name="banner_href" type="text" maxLength={300} defaultValue={b.href ?? ''} /></div>
          </div>
        </section>

        <div className="sticky-actions"><button className="btn btn-primary" type="submit">Save settings</button></div>
      </form>

      <section className="card narrow-form" id="password" aria-labelledby="h-pw">
        <div className="card-head"><h2 className="card-title" id="h-pw">Change your password</h2></div>
        <form action={changePassword}>
          <div className="field"><label htmlFor="current">Current password</label><input id="current" name="current" type="password" autoComplete="current-password" required /></div>
          <div className="field"><label htmlFor="next">New password (10+ characters)</label><input id="next" name="next" type="password" autoComplete="new-password" minLength={10} required /></div>
          <div className="field"><label htmlFor="again">New password again</label><input id="again" name="again" type="password" autoComplete="new-password" minLength={10} required /></div>
          <button className="btn btn-primary" type="submit">Change password</button>
        </form>
      </section>
    </>
  );
}

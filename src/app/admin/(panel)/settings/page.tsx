import { Card, Flash } from '@/components/admin/ui';
import { HOURS_KEYS } from '@/server/content';
import { kvGet } from '@/server/kv';
import { changePassword, saveSettings } from './actions';

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
  const sp = await searchParams;
  const s = (await kvGet<Settings>('settings')) ?? {};
  const c = s.contact ?? {};
  const so = s.social ?? {};
  const b = s.banner ?? {};
  return (
    <>
      <h1>Site settings</h1>
      <p className="sub">Contact details, opening hours and the announcement bar shown on the website. Blank fields fall back to the built-in values.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={saveSettings} className="adm-form">
        <Card title="Contact">
          <div className="adm-row">
            <label>Phone<input type="text" name="phone" defaultValue={c.phone ?? ''} maxLength={40} /></label>
            <label>WhatsApp number<input type="text" name="whatsapp" defaultValue={c.whatsapp ?? ''} maxLength={40} /></label>
            <label>Email<input type="text" name="email" defaultValue={c.email ?? ''} maxLength={120} /></label>
            <label>GSTIN<input type="text" name="gstin" defaultValue={c.gstin ?? ''} maxLength={20} /></label>
          </div>
          <label>Google Maps link<input type="text" name="mapsUrl" defaultValue={c.mapsUrl ?? ''} maxLength={300} /></label>
          <label>Typical reply time<input type="text" name="replyTime" defaultValue={s.replyTime ?? ''} maxLength={120} placeholder="We reply within one business day" /></label>
        </Card>
        <Card title="Social links">
          <div className="adm-row">
            <label>Instagram<input type="text" name="instagram" defaultValue={so.instagram ?? ''} maxLength={300} /></label>
            <label>LinkedIn<input type="text" name="linkedin" defaultValue={so.linkedin ?? ''} maxLength={300} /></label>
            <label>Facebook<input type="text" name="facebook" defaultValue={so.facebook ?? ''} maxLength={300} /></label>
            <label>YouTube<input type="text" name="youtube" defaultValue={so.youtube ?? ''} maxLength={300} /></label>
          </div>
        </Card>
        <Card title="Opening hours (24-hour, like 09:30)">
          <div className="adm-tablewrap">
            <table>
              <thead><tr><th>Day</th><th>Closed</th><th>Opens</th><th>Closes</th></tr></thead>
              <tbody>
                {HOURS_KEYS.map((d) => (
                  <tr key={d}>
                    <td>{DAY[d]}</td>
                    <td><input type="checkbox" name={`${d}_closed`} defaultChecked={s.hours?.[d]?.closed ?? false} aria-label={`${DAY[d]} closed`} /></td>
                    <td><input type="text" name={`${d}_open`} defaultValue={s.hours?.[d]?.open ?? ''} maxLength={5} style={{ width: 90 }} aria-label={`${DAY[d]} opens`} /></td>
                    <td><input type="text" name={`${d}_close`} defaultValue={s.hours?.[d]?.close ?? ''} maxLength={5} style={{ width: 90 }} aria-label={`${DAY[d]} closes`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label>Note under the hours<input type="text" name="hoursNote" defaultValue={s.hoursNote ?? ''} maxLength={200} /></label>
        </Card>
        <Card title="Announcement bar">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="banner_on" defaultChecked={b.enabled ?? false} /> Show the bar at the top of the website</label>
          <label>Text<input type="text" name="banner_text" defaultValue={b.text ?? ''} maxLength={200} /></label>
          <label>Link (optional)<input type="text" name="banner_href" defaultValue={b.href ?? ''} maxLength={300} /></label>
        </Card>
        <p><button className="adm-btn" type="submit">Save settings</button></p>
      </form>

      <Card title="Change your password" id="password">
        <form action={changePassword} className="adm-form" style={{ maxWidth: 420 }}>
          <label>Current password<input type="password" name="current" autoComplete="current-password" required /></label>
          <label>New password (10+ characters)<input type="password" name="next" autoComplete="new-password" minLength={10} required /></label>
          <label>New password again<input type="password" name="again" autoComplete="new-password" minLength={10} required /></label>
          <p><button className="adm-btn" type="submit">Change password</button></p>
        </form>
      </Card>
    </>
  );
}

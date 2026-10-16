import Link from 'next/link';
import { requireAdmin } from '@/server/admin-auth';
import { query } from '@/server/db';
import { BUYER_TYPES, STATUS_LABELS, STATUSES, ago, enquiryStats, type Enquiry } from '@/server/enquiries';
import { Badge, Icon, PageHead } from '@/components/admin/ui';

export const metadata = { title: 'Dashboard' };

const tz = 'Asia/Kolkata';

export default async function Dashboard() {
  const user = await requireAdmin();
  const [stats, recent, shop] = await Promise.all([
    enquiryStats(),
    query<Enquiry>('select * from enquiries where archived = 0 order by created_at desc, id desc limit 6'),
    query<{ pending: string; active: string; carts: string; apps: string }>(
      `select count(*) filter (where collection = 'orders' and data->>'status' = 'pending') as pending,
              count(*) filter (where collection = 'orders' and data->>'status' not in ('closed', 'cancelled')) as active,
              count(*) filter (where collection = 'carts' and data->>'status' = 'open') as carts,
              count(*) filter (where collection = 'applications' and data->>'status' = 'new') as apps
         from docs`,
    ),
  ]);
  const sh = shop[0];
  const now = new Date();
  const hour = Number(now.toLocaleString('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }));
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = user.name.trim().split(/\s+/)[0] || user.name;
  const today = now.toLocaleString('en-IN', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' });

  const series = stats.series.map((s) => s.n);
  const peak = Math.max(1, ...series);
  const sum30 = series.reduce((a, b) => a + b, 0);
  const maxProd = Math.max(1, ...stats.products.map((p) => p[1]), 1);
  const maxBuyer = Math.max(1, ...Object.values(stats.buyers));
  const pipeTotal = Math.max(1, Object.values(stats.by_status).reduce((a, b) => a + b, 0));
  const W = 600, H = 160, padL = 26, padB = 18, plotH = H - padB - 8, slot = (W - padL) / 30, bw = Math.max(4, slot - 5);
  const mid = Math.ceil(peak / 2);
  const dayLabel = (d: string) => new Date(`${d}T12:00:00+05:30`).toLocaleString('en-IN', { timeZone: tz, day: 'numeric', month: 'short' });
  const mondayIso = (() => {
    const d = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  const monthIso = `${now.toLocaleString('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit' })}-01`;
  const segs = STATUSES.reduce<{ k: string; x: number; w: number }[]>((acc, k) => {
    const w = ((stats.by_status[k] ?? 0) / pipeTotal) * 100;
    const x = acc.length ? acc[acc.length - 1]!.x + acc[acc.length - 1]!.w : 0;
    return [...acc, { k, x, w }];
  }, []);

  return (
    <>
      <header className="page-head">
        <div className="page-head-main">
          <p className="greeting">{today}</p>
          <h1 className="page-title">{hello}, {first}</h1>
          <p className="lead">
            {stats.new > 0
              ? <><b>{stats.new}</b> new enquir{stats.new === 1 ? 'y is' : 'ies are'} waiting for a first response.</>
              : 'Nothing is waiting for a first response. Here is how the enquiry pipeline looks.'}
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-primary" href="/admin/enquiries/"><Icon name="mail" />Open enquiries</Link>
        </div>
      </header>

      {stats.mail_failed > 0 ? (
        <p className="flash flash-warn" role="status">
          <Icon name="alert" />
          <span>{stats.mail_failed} enquir{stats.mail_failed === 1 ? 'y was' : 'ies were'} saved here but the email notification did not go through (email is not set up yet, so nothing is lost: every enquiry appears here).</span>
        </p>
      ) : null}

      <section aria-labelledby="h-at-a-glance">
        <h2 id="h-at-a-glance" className="sr-only">At a glance</h2>
        <ul className="kpis">
          <li><Link className="kpi kpi-hot" href="/admin/enquiries/?status=new"><span className="kpi-l">New</span><span><span className="kpi-n">{stats.new}</span><span className="kpi-note">&nbsp;not yet contacted</span></span></Link></li>
          <li><Link className="kpi" href="/admin/enquiries/"><span className="kpi-l">Unread</span><span><span className="kpi-n">{stats.unseen}</span><span className="kpi-note">&nbsp;not opened</span></span></Link></li>
          <li><Link className="kpi" href={`/admin/enquiries/?from=${mondayIso}`}><span className="kpi-l">This week</span><span><span className="kpi-n">{stats.week}</span><span className="kpi-note">&nbsp;since Monday</span></span></Link></li>
          <li><Link className="kpi" href={`/admin/enquiries/?from=${monthIso}`}><span className="kpi-l">This month</span><span><span className="kpi-n">{stats.month}</span><span className="kpi-note">&nbsp;{now.toLocaleString('en-IN', { timeZone: tz, month: 'long' })}</span></span></Link></li>
        </ul>
        <ul className="kpis">
          <li><Link className="kpi" href="/admin/orders/?status=pending"><span className="kpi-l">New orders</span><span><span className="kpi-n">{sh?.pending ?? 0}</span><span className="kpi-note">&nbsp;to confirm</span></span></Link></li>
          <li><Link className="kpi" href="/admin/orders/"><span className="kpi-l">Orders in progress</span><span><span className="kpi-n">{sh?.active ?? 0}</span><span className="kpi-note">&nbsp;not closed</span></span></Link></li>
          <li><Link className="kpi" href="/admin/carts/"><span className="kpi-l">Open carts</span><span><span className="kpi-n">{sh?.carts ?? 0}</span><span className="kpi-note">&nbsp;browsing now</span></span></Link></li>
          <li><Link className="kpi" href="/admin/applications/?status=new"><span className="kpi-l">New applications</span><span><span className="kpi-n">{sh?.apps ?? 0}</span><span className="kpi-note">&nbsp;to review</span></span></Link></li>
        </ul>
      </section>

      <div className="grid2">
        <section className="card" aria-labelledby="h-trend">
          <div className="card-head"><h2 className="card-title" id="h-trend">Enquiries, last 30 days</h2><span className="card-sub">{sum30} total</span></div>
          <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Enquiries per day over the last 30 days. Total ${sum30}, busiest day ${Math.max(...series)}.`}>
            {[peak, mid, 0].map((gv, i) => {
              const gy = 4 + plotH - (gv / peak) * plotH;
              return (
                <g key={i}>
                  <line className="grid" x1={padL} x2={W} y1={gy.toFixed(1)} y2={gy.toFixed(1)} />
                  <text className="axis" x="0" y={(gy + 3).toFixed(1)}>{gv}</text>
                </g>
              );
            })}
            {stats.series.map((s, i) => {
              const h = s.n === 0 ? 2 : Math.max(4, (s.n / peak) * plotH);
              const x = padL + i * slot + (slot - bw) / 2;
              return (
                <rect key={s.day} className={s.n === 0 ? 'bar bar-zero' : 'bar'} x={x.toFixed(1)} y={(4 + plotH - h).toFixed(1)} width={bw.toFixed(1)} height={h.toFixed(1)} rx="2">
                  <title>{`${dayLabel(s.day)}: ${s.n}`}</title>
                </rect>
              );
            })}
            {[0, 7, 14, 21, 29].map((i) => (
              <text key={i} className="axis" x={(padL + i * slot + slot / 2).toFixed(1)} y={H - 2} textAnchor="middle">{dayLabel(stats.series[i]?.day ?? '')}</text>
            ))}
          </svg>
          <p className="chart-meta"><span>Busiest day <b>{Math.max(...series)}</b></span><span>Daily average <b>{(sum30 / 30).toFixed(1)}</b></span></p>
        </section>

        <section className="card" aria-labelledby="h-pipe">
          <div className="card-head"><h2 className="card-title" id="h-pipe">Where enquiries stand</h2><span className="card-sub">{stats.active} active</span></div>
          {stats.active > 0 ? (
            <svg className="pipebar" viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden="true">
              <rect className="seg-track" width="100" height="3" />
              {segs.filter((g) => (stats.by_status[g.k] ?? 0) >= 1).map((g) => (
                <rect key={g.k} className={`seg-${g.k}`} x={g.x.toFixed(2)} width={Math.max(0.8, g.w - 0.5).toFixed(2)} height="3" />
              ))}
            </svg>
          ) : null}
          <ul className="pipe">
            {STATUSES.map((k) => (
              <li key={k}><Link href={`/admin/enquiries/?status=${k}`}><Badge s={k} label={STATUS_LABELS[k]} /> <b>{stats.by_status[k] ?? 0}</b></Link></li>
            ))}
          </ul>
          <p className="meta">{stats.archived} archived · {stats.total} in total</p>
        </section>

        <section className="card" aria-labelledby="h-prod">
          <div className="card-head"><h2 className="card-title" id="h-prod">Most requested products</h2></div>
          {stats.products.length === 0 ? (
            <p className="empty">Nothing yet. Products appear here once enquiries name them.</p>
          ) : (
            <ul className="hbars">
              {stats.products.map(([name, n]) => (
                <li key={name}>
                  <Link href={`/admin/enquiries/?product=${encodeURIComponent(name)}`}>
                    <span className="hb-l">{name}</span><b>{n}</b>
                    <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect className="track" width="100" height="4" /><rect className="fill" width={((n / maxProd) * 100).toFixed(1)} height="4" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="h-buyer">
          <div className="card-head"><h2 className="card-title" id="h-buyer">Who is enquiring</h2></div>
          {stats.active === 0 ? (
            <p className="empty">No enquiries yet.</p>
          ) : (
            <ul className="hbars">
              {Object.entries(BUYER_TYPES).map(([k, label]) => (
                <li key={k}>
                  <Link href={`/admin/enquiries/?buyer=${k}`}>
                    <span className="hb-l">{label}</span><b>{stats.buyers[k] ?? 0}</b>
                    <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true"><rect className="track" width="100" height="4" /><rect className="fill fill-grey" width={(((stats.buyers[k] ?? 0) / maxBuyer) * 100).toFixed(1)} height="4" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card" aria-labelledby="h-recent">
        <div className="card-head"><h2 className="card-title" id="h-recent">Latest enquiries</h2><Link href="/admin/enquiries/">See all <Icon name="arrow" /></Link></div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <span className="empty-ico"><Icon name="inbox" /></span>
            <p className="empty-title">No enquiries yet</p>
            <p>When someone submits the website form, it appears here.</p>
          </div>
        ) : (
          <ul className="latest">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/enquiries/${r.id}/`}>
                  <span className="l-main">{!r.seen ? <><span className="dot" title="Unread" /><span className="sr-only">Unread. </span></> : null}<b>{r.name}</b> · {r.company}</span>
                  <span className="l-sub">{r.product || 'No product named'} · {ago(r.created_at)}</span>
                  <Badge s={r.status} label={STATUS_LABELS[r.status]} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav aria-label="Quick links">
        <div className="quick">
          <Link href="/admin/careers/"><Icon name="plus" />Add a role</Link>
          <Link href="/admin/products/"><Icon name="box" />Products</Link>
          <Link href="/admin/enquiries/export/" prefetch={false}><Icon name="download" />Download CSV</Link>
          <Link href="/admin/audit/"><Icon name="clock" />Activity log</Link>
        </div>
      </nav>
    </>
  );
}

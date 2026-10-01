/**
 * /_lab/type — Full type specimen
 * §7.2: All scale levels + Devanagari tagline + metal gradient text
 * Dev-only, noindex.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '_lab / type',
  robots: { index: false, follow: false },
};

export default function TypePage() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-archivo, sans-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
        Type Specimen
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '3rem' }}>
        §7.1–§7.2 — Fluid type scale. Verify: matras not clipped, Devanagari renders, metal gradient on key words.
      </p>

      {/* ── Section label pattern ─────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: '1rem' }}>
          Section label pattern — §3 rule 4
        </div>
        <div className="section-label">
          01 — ABOUT ALOK PLASTICS
        </div>
        <div className="section-label">
          02 — PRODUCTS
        </div>
        <div className="section-label">
          03 — HOW WE WORK
        </div>
      </section>

      {/* ── Display ──────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>DISPLAY — clamp(2.75rem, 7vw, 5.5rem) · wdth 125 · wght 650</div>
        <p className="text-display" style={{ color: 'var(--ink)', fontFamily: 'var(--font-archivo, sans-serif)', marginBottom: '1rem' }}>
          The small parts that{' '}
          <span className="text-metal-gradient">keep big machines</span>{' '}
          running.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
          ↑ &quot;big machines&quot; in metal gradient — §11.5
        </p>
      </section>

      {/* ── H1 inner page ────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>H1 INNER — clamp(2.25rem, 5vw, 4rem) · wdth 112 · wght 650</div>
        <h1 className="text-h1-inner" style={{ color: 'var(--ink)', fontFamily: 'var(--font-archivo, sans-serif)', fontVariationSettings: '"wdth" 112' }}>
          Moulded in Chandigarh. Trusted across India.
        </h1>
      </section>

      {/* ── H2 ───────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>H2 — clamp(2rem, 4vw, 3.5rem) · wght 600</div>
        <h2 className="text-h2" style={{ color: 'var(--ink)', fontFamily: 'var(--font-archivo, sans-serif)' }}>
          Parts for water coolers, display counters and deep freezers.
        </h2>
      </section>

      {/* ── H3 ───────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>H3 — clamp(1.375rem, 2vw, 1.75rem) · wght 600</div>
        <h3 className="text-h3" style={{ color: 'var(--ink)', fontFamily: 'var(--font-archivo, sans-serif)' }}>
          Float Valves & F-Bush Components
        </h3>
      </section>

      {/* ── Lead ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>LEAD — 1.25rem · line-height 1.5 · wght 400</div>
        <p className="text-lead">
          We don&apos;t just manufacture plastic components — we build reliable, repeatable supply partnerships with businesses across India.
        </p>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>BODY — 1.0625rem · line-height 1.65 · max-width 68ch</div>
        <p className="text-body">
          Established in 1998, Alok Plastics began its manufacturing journey with a simple belief: good products build business, but trust builds long-term relationships. Starting with a focus on serving industrial and B2B customers, the company gradually grew through consistent manufacturing, dependable service, and an understanding of what businesses truly need from a manufacturing partner — quality, competitive pricing, reliable supply, and timely delivery.
        </p>
      </section>

      {/* ── Small ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>SMALL — 0.9375rem · line-height 1.55 · muted</div>
        <p className="text-small">
          Plot No-06, Industrial Area Phase II, Ram Darbar, Chandigarh 160003, India
        </p>
      </section>

      {/* ── Micro labels ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>MICRO — 0.75rem · uppercase · letter-spacing .16em · grey-metal</div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <span className="text-micro">01 — EST. 1998 · CHANDIGARH</span>
          <span className="text-micro">NYLON · HDPE · PPCP · BRASS</span>
          <span className="text-micro">DRG NO. AP-001</span>
          <span className="text-micro">MATERIAL: NYLON</span>
        </div>
      </section>

      {/* ── Mono ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>MONO — 11px · JetBrains Mono · drawing-sheet detail</div>
        <div className="text-mono" style={{ color: 'var(--muted)' }}>
          ALOK PLASTICS · EST. 1998 · CHANDIGARH 160003
        </div>
        <div className="text-mono" style={{ color: 'var(--muted)' }}>
          DRG. NO: AP-001 · MAT: NYLON 66 · Ø 22mm × 35mm
        </div>
        <div className="text-mono" style={{ color: 'var(--muted)' }}>
          LOADING: 087 ████████░░░ 87%
        </div>
      </section>

      {/* ── Devanagari tagline — CRITICAL CHECK ──────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)', background: 'var(--surface)', padding: '2rem', borderRadius: 2 }}>
        <div className="text-micro" style={{ marginBottom: '1.5rem' }}>
          DEVANAGARI TAGLINE — §2.7 · Noto Sans Devanagari 600 · verify matras not clipped
        </div>

        {/* Full size — §2.7: first half burgundy, second half grey-metal */}
        <div className="tagline-large" style={{ marginBottom: '1rem' }}>
          <p lang="sa" className="text-tagline-dev" style={{ marginBottom: '0.25rem' }}>
            <span className="tagline-part-1">भारते शिल्पितम्, </span>
            <span className="tagline-part-2">विश्वय निर्मितम्</span>
          </p>
          <p lang="en" className="text-small" style={{ color: 'var(--body)' }}>
            Crafted in Bharat, made for the world.
          </p>
        </div>

        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--muted)', background: 'var(--surface-alt)', padding: '0.5rem 0.75rem', borderRadius: 2, marginBottom: '1.5rem' }}>
          Unicode: भारते शिल्पितम्, विश्वय निर्मितम् — Note: विश्वय is the approved brand spelling (§1.2)
        </div>

        {/* With hairlines — §2.7 decorative flanking lines */}
        <p lang="sa" className="text-tagline-dev" style={{
          marginBottom: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--grey-metal), transparent)' }} aria-hidden />
          <span style={{ color: 'var(--burgundy)' }}>भारते शिल्पितम्, </span>
          <span style={{ color: 'var(--grey-metal)' }}>विश्वय निर्मितम्</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--grey-metal), transparent)' }} aria-hidden />
        </p>
        <p lang="en" className="text-small" style={{ color: 'var(--body)', textAlign: 'center' }}>
          Crafted in Bharat, made for the world.
        </p>

        {/* All sizes for matra check */}
        <div style={{ marginTop: '2rem' }}>
          <div className="text-micro" style={{ marginBottom: '1rem' }}>ALL SIZES — checking matras not clipped</div>
          {(['3rem', '2.5rem', '2rem', '1.5rem', '1.25rem', '1rem'] as const).map(size => (
            <p key={size} lang="sa" style={{
              fontFamily: 'var(--font-devanagari, sans-serif)',
              fontSize: size,
              fontWeight: 600,
              lineHeight: 1.6,
              color: 'var(--ink)',
              marginBottom: '0.5rem',
            }}>
              भारते शिल्पितम्, विश्वय निर्मितम्
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', marginLeft: '0.5rem' }}>
                {size}
              </span>
            </p>
          ))}
        </div>
      </section>

      {/* ── Numerals with tabular-nums ────────────────────────────────── */}
      <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--grey-warm)' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>
          NUMERALS — tabular-nums lining-nums · metal gradient on display numerals
        </div>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {[
            { value: '20', suffix: 'Cr+', label: 'Products delivered' },
            { value: '70', suffix: '%+', label: 'Repeat customers' },
            { value: '1998', suffix: '', label: 'Since' },
            { value: '100', suffix: '%', label: 'Commitment' },
          ].map(stat => (
            <div key={stat.value} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 4 }}>
                <span className="text-metal-gradient" style={{
                  fontFamily: 'var(--font-archivo, sans-serif)',
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  fontWeight: 650,
                  lineHeight: 1,
                  fontVariationSettings: '"wdth" 125',
                  fontVariantNumeric: 'tabular-nums lining-nums',
                }}>
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span style={{
                    fontFamily: 'var(--font-archivo, sans-serif)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: 'var(--grey-metal)',
                    marginTop: '0.5rem',
                  }}>
                    {stat.suffix}
                  </span>
                )}
              </div>
              {/* Measurement rule — §3.1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ width: 1, height: 8, background: 'var(--grey-metal)' }} />
                <span style={{ flex: 1, minWidth: 48, height: 1, background: 'var(--grey-metal)' }} />
                <span style={{ width: 1, height: 8, background: 'var(--grey-metal)' }} />
              </div>
              <p className="text-micro">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blush callout ────────────────────────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>BLUSH CALLOUT — from brand PDFs · §2.2</div>
        <div className="callout-blush">
          <p className="text-body" style={{ margin: 0 }}>
            <strong style={{ color: 'var(--ink)' }}>Note:</strong> The WhatsApp number, email, phone, and Google Maps URL are pending from the client.
            Each is marked <code>TODO(client)</code> in <code>src/content/site.ts</code>.
          </p>
        </div>
      </section>
    </div>
  );
}

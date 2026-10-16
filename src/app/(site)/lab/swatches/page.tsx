/**
 * /_lab/swatches — Colour token reference page
 * §2.1: All 24 tokens + 2 gradients with live contrast ratios
 * Dev-only, noindex.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '_lab / swatches',
  robots: { index: false, follow: false },
};

interface Swatch {
  name: string;
  variable: string;
  hex: string;
  group: string;
  note?: string;
  textOnly?: boolean;
}

const SWATCHES: Swatch[] = [
  /* Primary */
  { name: 'Burgundy', variable: '--burgundy', hex: '#581C25', group: 'Primary', note: 'THE primary — buttons, links, accents' },
  { name: 'Grey Metal', variable: '--grey-metal', hex: '#737171', group: 'Primary', note: 'Logo second colour — decoration only, never headlines', textOnly: true },
  /* Burgundy support */
  { name: 'Burgundy Night', variable: '--burgundy-night', hex: '#2E0A0F', group: 'Burgundy' },
  { name: 'Burgundy Deep', variable: '--burgundy-deep', hex: '#3E131A', group: 'Burgundy' },
  { name: 'Burgundy Bright', variable: '--burgundy-bright', hex: '#8A2C38', group: 'Burgundy' },
  { name: 'Rose', variable: '--rose', hex: '#C35A61', group: 'Burgundy' },
  { name: 'Rose Pale', variable: '--rose-pale', hex: '#E3B5B8', group: 'Burgundy' },
  { name: 'Pink Soft', variable: '--pink-soft', hex: '#F3DFE0', group: 'Burgundy' },
  { name: 'Blush', variable: '--blush', hex: '#FAF1F1', group: 'Burgundy' },
  /* Surfaces */
  { name: 'Surface', variable: '--surface', hex: '#FFFFFF', group: 'Surface' },
  { name: 'Canvas', variable: '--canvas', hex: '#F8F7F7', group: 'Surface', note: 'MAIN CANVAS' },
  { name: 'Surface Alt', variable: '--surface-alt', hex: '#F1EEEF', group: 'Surface' },
  { name: 'Mist', variable: '--mist', hex: '#ECE7E8', group: 'Surface' },
  { name: 'Grey Cloud', variable: '--grey-cloud', hex: '#E1DBDC', group: 'Surface' },
  { name: 'Grey Warm', variable: '--grey-warm', hex: '#D8D4D0', group: 'Surface' },
  { name: 'Silver', variable: '--silver', hex: '#909090', group: 'Surface', note: 'Decoration only — never text', textOnly: true },
  /* Text */
  { name: 'Ink', variable: '--ink', hex: '#1E1115', group: 'Text' },
  { name: 'Body', variable: '--body', hex: '#4A3D40', group: 'Text' },
  { name: 'Muted', variable: '--muted', hex: '#6B5F62', group: 'Text' },
  /* Functional */
  { name: 'WhatsApp', variable: '--whatsapp', hex: '#0F7B6C', group: 'Functional' },
  { name: 'Success', variable: '--success', hex: '#2E7D32', group: 'Functional' },
  { name: 'Warning', variable: '--warning', hex: '#8A5A00', group: 'Functional' },
  { name: 'Error', variable: '--error', hex: '#B3261E', group: 'Functional' },
  { name: 'Info', variable: '--info', hex: '#1F5F8B', group: 'Functional' },
];

const GRADIENTS = [
  {
    name: 'Metal Gradient',
    variable: '--metal-gradient',
    css: 'linear-gradient(175deg, #2E0A0F 0%, #581C25 32%, #8A2C38 58%, #C9A0A4 100%)',
    note: '175° top-lit — logo ribbons, key numerals, key words',
  },
  {
    name: 'Silver Gradient',
    variable: '--silver-gradient',
    css: 'linear-gradient(180deg, #6E6C6C 0%, #8F8D8D 45%, #BDBBBB 100%)',
    note: '180° top-lit — logo core, secondary metallic accents',
  },
];

function getContrastRatio(hex1: string, hex2: string): number {
  function toLinear(hex: string) {
    const c = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(c >> 16) & 255, (c >> 8) & 255, c & 255].map(v => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const l1 = toLinear(hex1);
  const l2 = toLinear(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

function WCAABadge({ ratio, size = 'normal' }: { ratio: number; size?: 'normal' | 'large' }) {
  const minAA = size === 'large' ? 3 : 4.5;
  const minAAA = size === 'large' ? 4.5 : 7;
  if (ratio >= minAAA) return <span style={{ background: '#2E7D32', color: '#fff', padding: '1px 4px', borderRadius: 2, fontSize: 10, fontWeight: 600 }}>AAA {ratio}</span>;
  if (ratio >= minAA)  return <span style={{ background: '#8A5A00', color: '#fff', padding: '1px 4px', borderRadius: 2, fontSize: 10, fontWeight: 600 }}>AA {ratio}</span>;
  return <span style={{ background: '#B3261E', color: '#fff', padding: '1px 4px', borderRadius: 2, fontSize: 10, fontWeight: 600 }}>FAIL {ratio}</span>;
}

const groups = ['Primary', 'Burgundy', 'Surface', 'Text', 'Functional'] as const;

export default function SwatchesPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-archivo, sans-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
        Colour Tokens
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        §2.1 — 24 tokens + 2 gradients, LOCKED from Brand Colour Guide v1.0 (Manhar Creatives).
        Contrast tested against canvas (#F8F7F7) and burgundy (#581C25).
      </p>

      {groups.map(group => (
        <section key={group} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: '1rem' }}>
            {group}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {SWATCHES.filter(s => s.group === group).map(swatch => {
              const onCanvas = getContrastRatio(swatch.hex, '#F8F7F7');
              const onBurgundy = getContrastRatio(swatch.hex, '#581C25');
              return (
                <div key={swatch.variable}
                  style={{
                    border: '1px solid var(--grey-warm)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'var(--surface)',
                  }}>
                  {/* Colour chip */}
                  <div style={{
                    height: 72,
                    background: swatch.hex,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '6px 8px',
                  }}>
                    <span style={{ color: onCanvas > 3 ? '#F8F7F7' : '#1E1115', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}>
                      {swatch.hex}
                    </span>
                  </div>
                  {/* Details */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginBottom: 2 }}>
                      {swatch.name}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--muted)', marginBottom: 6 }}>
                      {swatch.variable}
                    </div>
                    {swatch.note && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.4 }}>
                        {swatch.note}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>on canvas:</span>
                      <WCAABadge ratio={onCanvas} />
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>on burg:</span>
                      <WCAABadge ratio={onBurgundy} />
                    </div>
                    {swatch.textOnly && (
                      <div style={{ marginTop: 4, fontSize: 10, color: 'var(--warning)', fontWeight: 600 }}>
                        DECORATION ONLY — never for text
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Gradients */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: '1rem' }}>
          Derived Gradients (stops exist ONLY here)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {GRADIENTS.map(grad => (
            <div key={grad.variable} style={{ border: '1px solid var(--grey-warm)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: 80, background: grad.css }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)', marginBottom: 2 }}>{grad.name}</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--muted)', marginBottom: 4 }}>{grad.variable}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{grad.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contrast pairs from §2.5 */}
      <section>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: '1rem' }}>
          Verified Contrast Pairs — §2.5
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--burgundy)', background: 'var(--surface-alt)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink)' }}>Pair</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>Target</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>Computed</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--ink)' }}>Use</th>
            </tr>
          </thead>
          <tbody>
            {[
              { pair: 'Ink on Soft White', text: '#1E1115', bg: '#F8F7F7', target: '17.1', use: 'headings' },
              { pair: 'Body on Soft White', text: '#4A3D40', bg: '#F8F7F7', target: '9.7', use: 'paragraphs' },
              { pair: 'Burgundy on Soft White', text: '#581C25', bg: '#F8F7F7', target: '12.2', use: 'links, highlights' },
              { pair: 'White on Burgundy', text: '#FFFFFF', bg: '#581C25', target: '13.1', use: 'buttons, banners, footer' },
              { pair: 'Rose Pale on Burgundy', text: '#E3B5B8', bg: '#581C25', target: '7.2', use: 'small accents on burgundy' },
              { pair: 'Muted on Soft White', text: '#6B5F62', bg: '#F8F7F7', target: '5.7', use: 'helper text' },
              { pair: 'Metal Grey on Soft White', text: '#737171', bg: '#F8F7F7', target: '4.5 (min)', use: 'captions & micro-labels only' },
              { pair: 'White on WhatsApp', text: '#FFFFFF', bg: '#0F7B6C', target: '5.2', use: 'WhatsApp button' },
              { pair: 'Silver on Soft White ⚠', text: '#909090', bg: '#F8F7F7', target: '3.0 (FAIL)', use: 'never text — decoration only' },
            ].map(row => (
              <tr key={row.pair} style={{ borderBottom: '1px solid var(--grey-warm)' }}>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 20, height: 20,
                    background: row.bg,
                    border: '1px solid var(--grey-warm)',
                    borderRadius: 2,
                    verticalAlign: 'middle',
                    marginRight: 6,
                  }} />
                  <span style={{ color: row.text, background: row.bg, padding: '0 4px' }}>Aa</span>
                  {'  '}{row.pair}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--muted)' }}>{row.target}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <WCAABadge ratio={getContrastRatio(row.text, row.bg)} />
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: '0.8125rem' }}>{row.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

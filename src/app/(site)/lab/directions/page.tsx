/**
 * /lab/directions — 3 moodboard directions (§4.2)
 * A: Drawing Sheet · B: Polished Metal · C: Folded Ribbon
 * Default recommendation: B+A blend with C for transitions (from §4.2)
 * Dev-only, noindex.
 */

import type { Metadata } from 'next';
import Logo from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: '_lab / directions',
  robots: { index: false, follow: false },
};

function ProofStrip({ variant }: { variant: 'A' | 'B' | 'C' }) {
  const stats = [
    { value: '20 Cr+', label: 'Products delivered' },
    { value: '70%+', label: 'Repeat customers' },
    { value: '1998', label: 'Since' },
    { value: '100%', label: 'Commitment' },
  ];

  const bgStyle: Record<string, React.CSSProperties> = {
    A: { background: 'var(--canvas)', border: '1px solid var(--grey-warm)', fontFamily: 'monospace' },
    B: { background: 'var(--canvas)' },
    C: { background: 'linear-gradient(175deg, var(--burgundy-night), var(--burgundy))' },
  };

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      padding: '1.5rem',
      ...bgStyle[variant],
    }}>
      {stats.map((stat, i) => (
        <div key={stat.value} style={{
          flex: 1,
          textAlign: 'center',
          borderLeft: i > 0 ? '1px solid ' + (variant === 'C' ? 'rgba(255,255,255,0.15)' : 'var(--grey-warm)') : 'none',
          padding: '0 1.5rem',
        }}>
          <div style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 650,
            fontFamily: 'var(--font-archivo, sans-serif)',
            fontVariationSettings: '"wdth" 125',
            background: variant === 'C' ? 'none' : 'var(--metal-gradient)',
            WebkitBackgroundClip: variant === 'C' ? 'none' : 'text',
            WebkitTextFillColor: variant === 'C' ? 'white' : 'transparent',
            backgroundClip: variant === 'C' ? 'none' : 'text',
            color: variant === 'C' ? 'white' : 'transparent',
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: variant === 'C' ? 'rgba(255,255,255,0.7)' : 'var(--grey-metal)',
            marginTop: 4,
            fontFamily: variant === 'A' ? 'monospace' : 'inherit',
          }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ variant }: { variant: 'A' | 'B' | 'C' }) {
  const styles: Record<string, React.CSSProperties> = {
    A: {
      background: 'var(--surface)',
      border: '1px solid var(--grey-warm)',
      borderRadius: 2,
      padding: '1.5rem',
      position: 'relative',
    },
    B: {
      background: 'var(--surface)',
      border: '1px solid var(--grey-warm)',
      borderRadius: 2,
      padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(30,17,21,0.06)',
    },
    C: {
      background: 'var(--surface)',
      border: '1px solid var(--grey-warm)',
      borderRadius: 2,
      padding: '1.5rem',
      clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
    },
  };

  return (
    <div style={styles[variant]}>
      {/* Corner crop marks — A and B */}
      {variant !== 'C' && (
        <>
          <div style={{ position: 'absolute', top: 6, left: 6, width: 10, height: 1, background: 'var(--grey-warm)' }} aria-hidden />
          <div style={{ position: 'absolute', top: 6, left: 6, width: 1, height: 10, background: 'var(--grey-warm)' }} aria-hidden />
        </>
      )}
      {/* Material tag */}
      <div style={{
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: variant === 'A' ? 'var(--grey-metal)' : 'var(--burgundy)',
        fontWeight: 600,
        fontFamily: variant === 'A' ? 'monospace' : 'inherit',
        marginBottom: '0.5rem',
        border: variant === 'B' ? '1px solid var(--rose-pale)' : 'none',
        padding: variant === 'B' ? '2px 6px' : 0,
        display: 'inline-block',
        borderRadius: variant === 'B' ? 2 : 0,
        background: variant === 'B' ? 'var(--blush)' : 'none',
      }}>
        NYLON
      </div>

      {/* Drawing-sheet micro-label */}
      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: 'var(--grey-metal)',
        fontWeight: 600,
        fontFamily: variant === 'A' ? 'monospace' : 'inherit',
        marginBottom: '0.25rem',
      }}>
        01 — FLOAT VALVE
      </div>

      {/* Product name */}
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--ink)',
        fontFamily: 'var(--font-archivo, sans-serif)',
        marginBottom: '0.5rem',
      }}>
        Float Valve for Water Coolers
      </h3>

      {/* Pictogram placeholder area */}
      <div style={{
        height: 96,
        background: variant === 'A' ? 'var(--surface-alt)' : 'var(--canvas)',
        border: variant === 'A' ? '1px dashed var(--grey-warm)' : '1px solid var(--grey-warm)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.75rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
          {variant === 'A' ? '[ PICTOGRAM ]' : 'pictogram'}
        </span>
      </div>

      {/* CTA */}
      <div style={{ color: 'var(--burgundy)', fontSize: '0.875rem', fontWeight: 600 }}>
        View details ↗
      </div>
    </div>
  );
}

function HeroPreview({ variant }: { variant: 'A' | 'B' | 'C' }) {
  const heroStyles: Record<string, React.CSSProperties> = {
    A: {
      background: 'var(--canvas)',
      border: '1px solid var(--grey-warm)',
      padding: '2.5rem',
      position: 'relative',
      minHeight: 240,
    },
    B: {
      background: 'var(--surface-alt)',
      padding: '2.5rem',
      position: 'relative',
      minHeight: 240,
      boxShadow: 'inset 0 0 60px rgba(88,28,37,0.04)',
    },
    C: {
      background: 'linear-gradient(175deg, var(--burgundy-night), var(--burgundy))',
      padding: '2.5rem',
      position: 'relative',
      minHeight: 240,
      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)',
    },
  };

  return (
    <div style={heroStyles[variant]}>
      {/* Technical grid — A and B */}
      {variant !== 'C' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(var(--grey-metal) 0px, transparent 1px, transparent 7px, transparent 8px), repeating-linear-gradient(90deg, var(--grey-metal) 0px, transparent 1px, transparent 7px, transparent 8px)',
          backgroundSize: '8px 8px',
          opacity: 0.03,
          pointerEvents: 'none',
        }} aria-hidden />
      )}

      {/* Eyebrow */}
      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: variant === 'C' ? 'rgba(255,255,255,0.6)' : 'var(--grey-metal)',
        fontWeight: 600,
        fontFamily: variant === 'A' ? 'monospace' : 'inherit',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ width: 24, height: 2, background: 'var(--burgundy)', flexShrink: 0 }} aria-hidden />
        01 — EST. 1998 · CHANDIGARH
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        fontWeight: 650,
        fontFamily: 'var(--font-archivo, sans-serif)',
        fontVariationSettings: '"wdth" 125',
        lineHeight: 1.05,
        color: variant === 'C' ? 'white' : 'var(--ink)',
        marginBottom: '1rem',
        maxWidth: '70%',
      }}>
        The small parts that keep big machines running.
      </h2>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <span style={{
          background: 'var(--burgundy)',
          color: 'white',
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: 2,
        }}>
          Enquire Now
        </span>
        <span style={{
          background: 'var(--whatsapp)',
          color: 'white',
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: 2,
        }}>
          WhatsApp Us
        </span>
      </div>
    </div>
  );
}

interface DirectionCardProps {
  id: 'A' | 'B' | 'C';
  name: string;
  description: string;
  characteristics: string[];
  recommended?: boolean;
}

function DirectionCard({ id, name, description, characteristics, recommended }: DirectionCardProps) {
  return (
    <section style={{
      border: recommended ? '2px solid var(--burgundy)' : '1px solid var(--grey-warm)',
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: '3rem',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        background: recommended ? 'var(--blush)' : 'var(--surface-alt)',
        borderBottom: '1px solid var(--grey-warm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: 4 }}>
            Direction {id}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-archivo, sans-serif)', margin: 0 }}>
            {name}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{description}</p>
        </div>
        {recommended && (
          <span style={{
            background: 'var(--burgundy)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 2,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            RECOMMENDED
          </span>
        )}
      </div>

      {/* Hero preview */}
      <div style={{ padding: '1.5rem', background: 'var(--canvas)' }}>
        <div className="text-micro" style={{ marginBottom: '0.75rem' }}>HERO</div>
        <HeroPreview variant={id} />
      </div>

      {/* Product card */}
      <div style={{ padding: '1.5rem', background: 'var(--surface-alt)' }}>
        <div className="text-micro" style={{ marginBottom: '0.75rem' }}>PRODUCT CARD</div>
        <div style={{ maxWidth: 280 }}>
          <ProductCard variant={id} />
        </div>
      </div>

      {/* Proof strip */}
      <div style={{ padding: '1.5rem', background: 'var(--canvas)' }}>
        <div className="text-micro" style={{ marginBottom: '0.75rem' }}>PROOF STRIP</div>
        <ProofStrip variant={id} />
      </div>

      {/* Characteristics */}
      <div style={{ padding: '1.5rem', background: 'var(--surface)' }}>
        <div className="text-micro" style={{ marginBottom: '0.75rem' }}>CHARACTERISTICS</div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--body)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {characteristics.map(c => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </section>
  );
}

export default function DirectionsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-archivo, sans-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.5rem' }}>
        Moodboard Directions
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        §4.2 — Three directions: hero + product card + proof strip. Default recommendation: B+A blend with C for transitions.
      </p>
      <div style={{
        background: 'var(--blush)',
        borderLeft: '4px solid var(--burgundy)',
        padding: '0.75rem 1rem',
        marginBottom: '2.5rem',
        fontSize: '0.875rem',
        color: 'var(--body)',
      }}>
        <strong style={{ color: 'var(--ink)' }}>Recommended blend:</strong> Direction B (Polished Metal) as the base system,
        with A (Drawing Sheet) furniture details — section labels, crop marks, measurement rules — and
        C (Folded Ribbon) clip-path diagonals used for section transitions and image reveals.
        This is the default per §4.2 unless overridden with a recorded reason.
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.875rem' }}>
        <a href="#direction-B" style={{ color: 'var(--burgundy)', fontWeight: 600 }}>→ B: Polished Metal (recommended)</a>
        <a href="#direction-A" style={{ color: 'var(--muted)' }}>A: Drawing Sheet</a>
        <a href="#direction-C" style={{ color: 'var(--muted)' }}>C: Folded Ribbon</a>
      </div>

      {/* Direction B first — recommended */}
      <div id="direction-B">
        <DirectionCard
          id="B"
          name="Polished Metal"
          description="Light, metallic gradients, specular sweeps, product macro photography forward. The metal gradient on key numerals and words. Clean white/canvas surfaces with controlled burgundy blocks."
          recommended
          characteristics={[
            'Metal gradient on display numerals, key words, and the preloader',
            'Product cut-outs on --surface with crisp contact shadows',
            'Blush callout boxes with 4px burgundy left rule',
            'Burgundy as the single action colour — limited to one block per viewport',
            'Technical tags above product names (NYLON · HDPE · PPCP · BRASS)',
            'One hot specular sweep on card hover (the "light catching polished metal" motif)',
          ]}
        />
      </div>

      <div id="direction-A">
        <DirectionCard
          id="A"
          name="Drawing Sheet"
          description="Technical-drawing furniture forward — crop marks, grid, corner registers, mono micro-type. Site feels like an engineering drawing that got a pulse."
          characteristics={[
            'Faint 8px grid at 3% in section backgrounds, radially masked',
            'Corner crop marks on primary cards (L-shaped 10px hairlines)',
            'Measurement rules with end caps under stat numbers',
            'Mono micro-type for DRG labels and coordinates',
            'Section dividers as 2px diagonal rules (folded sheet edge)',
            'Drawing-sheet title blocks for product spec tables',
          ]}
        />
      </div>

      <div id="direction-C">
        <DirectionCard
          id="C"
          name="Folded Ribbon"
          description="Diagonal clip-paths and folded burgundy ribbons as the dominant graphic device. Section exits are diagonal cuts echoing the A's peak angle (≈44–46°)."
          characteristics={[
            'Hero exit: diagonal clip-path into next section',
            'Card image masks revealed with lower-left → upper-right diagonal wipe',
            'Burgundy ribbon accent shapes as section dividers',
            'K-arm direction (↗) used for all reveals and arrow icons',
            'Interlocking stepped block edges (L+O chain link motif)',
            'Strong contrast: burgundy on dark, full-bleed burgundy sections',
          ]}
        />
      </div>

      {/* Logo placement test */}
      <section style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid var(--grey-warm)', borderRadius: 2 }}>
        <div className="text-micro" style={{ marginBottom: '1rem' }}>LOGO VARIANTS — §2.6 PLACEHOLDER (client logo file needed)</div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--canvas)', padding: '1rem', border: '1px solid var(--grey-warm)', borderRadius: 2, marginBottom: 4 }}>
              <Logo variant="color" lockup="full" style={{ width: 140, height: 40 }} />
            </div>
            <span className="text-micro">color · full</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--burgundy)', padding: '1rem', borderRadius: 2, marginBottom: 4 }}>
              <Logo variant="white" lockup="full" style={{ width: 140, height: 40 }} />
            </div>
            <span className="text-micro">white · full</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--ink)', padding: '1rem', borderRadius: 2, marginBottom: 4 }}>
              <Logo variant="bright" lockup="full" style={{ width: 140, height: 40 }} />
            </div>
            <span className="text-micro">bright · full</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--canvas)', padding: '1rem', border: '1px solid var(--grey-warm)', borderRadius: 2, marginBottom: 4 }}>
              <Logo variant="color" lockup="mark" style={{ width: 80, height: 40 }} />
            </div>
            <span className="text-micro">color · mark</span>
          </div>
        </div>
      </section>
    </div>
  );
}

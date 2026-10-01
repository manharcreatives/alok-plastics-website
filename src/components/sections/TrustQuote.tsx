/**
 * S10 · TrustQuote — §13
 * bg: --canvas
 * Heading + 3 visual trust signals (verified facts only). The pull-quote was removed:
 * it was drafted copy, and the client-sourced USP quote already appears in RequirementToRepeat.
 * No testimonials until client supplies verified quotes (§19 honesty rule).
 * Testimonial slot is scaffolded but renders nothing until data exists.
 */

'use client';

import { useRef } from 'react';
import { useMaskRise } from '@/hooks/useMotion';
import { site } from '@/content/site';

/* Three trust signals — each grounded ONLY in verified facts (site.ts `proof`) */
const TRUST_SIGNALS = [
  {
    id: 'est',
    icon: '◎',
    label: 'Manufacturing since 1998',
    body: `Alok Plastics has been manufacturing in ${site.contact.city} since ${site.foundingYear}.`,
  },
  {
    id: 'repeat',
    icon: '↻',
    label: '70%+ repeat customers',
    body: 'More than 70% of our customers come back to order again.',
  },
  {
    id: 'moulding',
    icon: '◈',
    label: 'Automatic moulding machines',
    body: 'Consistent quality and faster production.',
  },
] as const;

/* Testimonials — hidden until client provides verified, attributed quotes */
const TESTIMONIALS: { quote: string; name: string; company: string }[] = [
  /* TODO(client): supply 2–3 real testimonials with full name + company name.
     §19 honesty rule: never invent customer names or quotes. Leave array empty. */
];

export default function TrustQuote() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useMaskRise(headingRef);

  return (
    <section
      aria-labelledby="trust-heading"
      style={{
        background: 'var(--canvas)',
        padding: 'var(--section-y) var(--grid-page-padding)',
        borderTop: '1px solid var(--grey-cloud)',
      }}
    >
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>

        {/* ── Central pull quote ──────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          maxWidth: '64ch',
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: 'var(--space-xl)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span aria-hidden="true" style={{ width: 24, height: 2, background: 'var(--burgundy)', display: 'inline-block' }} />
          </div>

          <h2
            id="trust-heading"
            ref={headingRef}
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: '"wdth" 125',
              fontSize: 'clamp(1.5rem, 2.75vw, 2.25rem)',
              fontWeight: 650,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              marginBottom: 0,
            }}
          >
            Why manufacturers choose Alok Plastics.
          </h2>

        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--grey-cloud)', margin: '0 0 var(--space-xl)' }} />

        {/* ── Trust signals grid ───────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 'var(--space-xl)',
        }}>
          {TRUST_SIGNALS.map(signal => (
            <div
              key={signal.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Icon */}
              <span
                aria-hidden="true"
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--burgundy)',
                  lineHeight: 1,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {signal.icon}
              </span>

              <p style={{
                fontFamily: 'var(--font-archivo)',
                fontVariationSettings: '"wdth" 125',
                fontSize: '1.0625rem',
                fontWeight: 650,
                color: 'var(--ink)',
                letterSpacing: '-0.01em',
              }}>
                {signal.label}
              </p>

              <p style={{
                fontSize: '0.9375rem',
                color: 'var(--body)',
                lineHeight: 1.6,
              }}>
                {signal.body}
              </p>
            </div>
          ))}
        </div>

        {/* ── Testimonials (hidden until client supplies) ─────────── */}
        {TESTIMONIALS.length > 0 && (
          <div style={{
            marginTop: 'var(--space-xl)',
            borderTop: '1px solid var(--grey-cloud)',
            paddingTop: 'var(--space-xl)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} style={{ margin: 0 }}>
                <blockquote style={{ margin: 0 }}>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--body)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>
                  {t.name}, {t.company}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

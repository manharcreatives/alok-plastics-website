/**
 * S6 · IndustriesBento — §13 (redesigned in Round 2, ask 11)
 * bg: --surface
 *
 * Asymmetric bento: one wide core-market tile (the section's single burgundy block)
 * and seven industry cards in mixed sizes. Each card has a drawn engineering-sheet
 * scene (src/components/art/IndustryScenes.tsx) inside a diagonal-cut mask; a real
 * photo (Industry.image) replaces the scene automatically when supplied.
 * Hover / keyboard focus: the application line is revealed by a diagonal wipe and the
 * arrow nudges up-right. On touch (hover: none) and under reduced motion the line is
 * always visible. Logo marquee stays hidden until the client supplies logos.
 */

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { industriesConfig, coreMarket } from '@/content/industries';
import { gsap, ScrollTrigger, DURATIONS, EASINGS } from '@/lib/motion';
import FoldEdge, { FOLD_SECTION_CSS } from '@/components/sections/FoldEdge';
import { useMaskRise } from '@/hooks/useMotion';
import type { Industry } from '@/content/types';

gsap.registerPlugin(ScrollTrigger);

/* Illustrations are code-split: the section paints with reserved media boxes first. */
const IndustryScene = dynamic(() => import('@/components/art/IndustryScenes'));
const CoreMarketScene = dynamic(() =>
  import('@/components/art/IndustryScenes').then(m => m.CoreMarketScene),
);

/* Mixed-size bento: spans on the 12-col desktop grid, in source order. */
const SPANS = ['w7', 'w5', 'w4', 'w4', 'w4', 'w5', 'w7'] as const;

function IndustryCard({ industry, span }: { industry: Industry; span: string }) {
  return (
    <Link href={`/industries/#${industry.slug}`} className={`ind-card ${span}`} data-ind-card>
      <div className="ind-mw">
        <div className="ind-media">
          <div className="ind-art">
            {industry.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={industry.image.src}
                alt={industry.image.alt}
                width={industry.image.w}
                height={industry.image.h}
                loading="lazy"
                decoding="async"
                className="ind-photo"
              />
            ) : (
              industry.scene && <IndustryScene scene={industry.scene} />
            )}
          </div>
        </div>
        <svg className="ind-cut" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M40 0L0 40" />
        </svg>
        <span className="ind-go" aria-hidden="true">
          <ArrowUpRight weight="light" size={20} />
        </span>
      </div>
      <div className="ind-body">
        <h3 className="ind-name">{industry.name}</h3>
        <div className="ind-lw">
          <span className="ind-hint" aria-hidden="true"><i /></span>
          <p className="ind-line"><span>{industry.line}</span></p>
        </div>
      </div>
    </Link>
  );
}

const CSS = `${FOLD_SECTION_CSS}
.ind-sec { --pad-top: calc(var(--section-y) + 8px); background: var(--surface); padding-left: var(--grid-page-padding); padding-right: var(--grid-page-padding); padding-bottom: calc(var(--section-y) + 16px); }
.ind-head { display: flex; flex-direction: column; gap: var(--space-sm); }
.ind-label { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--muted); font-weight: 600; font-family: var(--font-archivo); }
.ind-label i { width: 24px; height: 2px; background: var(--burgundy); display: inline-block; }
.ind-head h2 { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.75rem, 3.5vw, 2.75rem); line-height: 1.1; letter-spacing: -0.025em; font-weight: 650; color: var(--ink); max-width: 22ch; text-wrap: balance; }
.ind-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); margin-top: var(--space-xl); }

/* ── core market (the one burgundy block) ── */
.ind-core { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); background: var(--burgundy); border-radius: var(--radius-card); box-shadow: inset 0 1px 0 rgba(255,255,255,.18); overflow: hidden; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 56px), calc(100% - 56px) 100%, 0 100%); }
.ind-core-copy { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg); min-width: 0; }
.ind-core-kicker { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--rose-pale); font-weight: 600; }
.ind-core-kicker i { width: 24px; height: 2px; background: var(--rose-pale); display: inline-block; }
.ind-core-name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: clamp(1.5rem, 2.8vw, 2.25rem); font-weight: 650; color: var(--surface); line-height: 1.12; letter-spacing: -0.02em; text-wrap: balance; }
.ind-core-desc { font-size: 1rem; color: var(--rose-pale); line-height: 1.6; max-width: 46ch; }
.ind-core-name span { display: block; }
.ind-core-name span + span { margin-top: 2px; }
.ind-core-cta { display: inline-flex; align-items: center; gap: var(--space-xs); align-self: flex-start; margin-top: var(--space-sm); color: var(--surface); font-weight: 600; font-size: 0.9375rem; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: var(--rose); }
.ind-core-cta svg { transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ind-core-cta:hover svg, .ind-core-cta:focus-visible svg { transform: translate3d(2px, -2px, 0); }
.ind-core-art { position: relative; min-height: 220px; padding: var(--space-sm) var(--space-md) 0; display: flex; align-items: flex-end;  }
.ind-core-art .ind-art-svg { width: 100%; height: auto; max-height: 100%; display: block; }

/* ── industry cards ── */
.ind-card { position: relative; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--grey-warm); border-radius: var(--radius-card); box-shadow: inset 0 1px 0 rgba(255,255,255,.9); color: inherit; text-decoration: none; min-width: 0; transition: border-color .4s cubic-bezier(.16,1,.3,1), box-shadow .4s cubic-bezier(.16,1,.3,1); }
.ind-card:hover, .ind-card:focus-visible { border-color: var(--grey-metal); box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 0 var(--grey-warm); }
.ind-mw { position: relative; }
.ind-media { position: relative; height: clamp(200px, 56vw, 260px); overflow: hidden; background: var(--surface-alt); border-radius: var(--radius-card) var(--radius-card) 0 0; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%); }
.ind-media::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(115,113,113,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(115,113,113,.07) 1px, transparent 1px); background-size: 16px 16px; -webkit-mask-image: radial-gradient(ellipse at 40% 35%, var(--ink) 0%, transparent 78%); mask-image: radial-gradient(ellipse at 40% 35%, var(--ink) 0%, transparent 78%); }
.ind-art { position: absolute; inset: 0; transform: translate3d(0,0,0); transition: transform 700ms cubic-bezier(.16,1,.3,1); will-change: transform; }
.ind-art-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.ind-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
.ind-card:hover .ind-art, .ind-card:focus-visible .ind-art { transform: translate3d(0,-4px,0) scale(1.03); }
.ind-cut { position: absolute; right: 0; bottom: 0; width: 40px; height: 40px; overflow: visible; }
.ind-cut path { fill: none; stroke: var(--grey-warm); stroke-width: 1.5; transition: stroke 200ms cubic-bezier(.16,1,.3,1); }
.ind-card:hover .ind-cut path, .ind-card:focus-visible .ind-cut path { stroke: var(--burgundy); }
.ind-go { position: absolute; right: 6px; bottom: 6px; display: grid; place-items: center; width: 24px; height: 24px; color: var(--burgundy); transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.ind-card:hover .ind-go, .ind-card:focus-visible .ind-go { transform: translate3d(2px, -2px, 0); }
.ind-body { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-md); padding-top: var(--space-sm); padding-bottom: var(--space-sm); flex: 1; }
.ind-name { font-family: var(--font-archivo); font-variation-settings: "wdth" 125; font-size: 1.125rem; font-weight: 650; color: var(--ink); letter-spacing: -0.01em; line-height: 1.25; max-width: 24ch; }
.ind-hint { position: absolute; left: 0; top: 10px; display: flex; align-items: center; }
.ind-hint i { width: 24px; height: 1px; background: var(--grey-metal); display: inline-block; transition: width 400ms cubic-bezier(.16,1,.3,1), background-color 400ms cubic-bezier(.16,1,.3,1); }
.ind-card:hover .ind-hint i, .ind-card:focus-visible .ind-hint i { width: 48px; background: var(--burgundy); }
.ind-lw { position: relative; min-height: 3.1em; }
.ind-line { font-size: 0.9375rem; color: var(--body); line-height: 1.55; max-width: 44ch; }
.ind-line span { display: block; background: var(--surface); position: relative; }
.ind-card::after { content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--burgundy); transform: scaleX(0); transform-origin: left; transition: transform .7s cubic-bezier(.16,1,.3,1); }
.ind-card:hover::after, .ind-card:focus-visible::after { transform: scaleX(1); }
.ind-card:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }

/* precise pointers: hide the line until hover/focus, then wipe it in on the 44-degree diagonal */
@media not all and (hover: hover) and (pointer: fine) { .ind-hint { display: none; } }
@media (prefers-reduced-motion: reduce) { .ind-hint { display: none; } }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .ind-line span { clip-path: polygon(0 0, 0 0, -60% 100%, 0 100%); transition: clip-path 900ms cubic-bezier(.16,1,.3,1); }
  .ind-card:hover .ind-line span, .ind-card:focus-visible .ind-line span { clip-path: polygon(0 0, 160% 0, 100% 100%, 0 100%); }
}

@media (min-width: 640px) {
  .ind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ind-core { grid-column: span 2; }
  .ind-card.w7:last-child { grid-column: span 2; }
  .ind-media { height: clamp(200px, 26vw, 250px); }
}
@media (min-width: 1024px) {
  .ind-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--space-md); }
  .ind-core { grid-column: 1 / -1; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
  .ind-core-copy { padding: var(--space-xl) var(--space-lg) var(--space-xl) var(--space-xl); justify-content: center; }
  .ind-core-art { padding: var(--space-lg) var(--space-lg) 0 0; }
  .ind-card.w7, .ind-card.w7:last-child { grid-column: span 7; } .ind-card.w5 { grid-column: span 5; } .ind-card.w4 { grid-column: span 4; }
  .ind-media { height: clamp(220px, 19vw, 280px); }
}
`;

export default function IndustriesBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useMaskRise(headingRef);

  /* Cards enter on the K diagonal: a rectangle grows from the lower-left corner. */
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-ind-card]');
      gsap.set(cards, { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' });
      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: batch =>
          gsap.to(batch, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: DURATIONS.long,
            ease: EASINGS.inOut,
            stagger: 0.12,
            onComplete: () => gsap.set(batch, { clearProps: 'clipPath' }),
          }),
      });
    });
    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="fold-sec ind-sec" aria-labelledby="industries-heading">
      <style>{CSS}</style>
      <FoldEdge />
      <div style={{ maxWidth: 'calc(var(--grid-max) + 2 * var(--grid-page-padding))', margin: '0 auto' }}>
        <div className="ind-head">
          <div className="ind-label"><i aria-hidden="true" />Industries</div>
          <h2 id="industries-heading" ref={headingRef}>Built for the industries that build India.</h2>
        </div>

        <div className="ind-grid">
          {/* Core market — the one burgundy block in this section */}
          <div className="ind-core">
            <div className="ind-core-copy">
              <div className="ind-core-kicker"><i aria-hidden="true" />Core market</div>
              <p className="ind-core-name" aria-label={coreMarket.name}>
                {coreMarket.name.split(' · ').map(n => <span key={n} aria-hidden="true">{n}</span>)}
              </p>
              <p className="ind-core-desc">{coreMarket.description}</p>
              <Link href="/products/" className="ind-core-cta">
                Browse the parts <ArrowUpRight weight="light" size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="ind-core-art" aria-hidden="true">
              <CoreMarketScene />
            </div>
          </div>

          {industriesConfig.industries.map((industry, i) => (
            <IndustryCard key={industry.id} industry={industry} span={SPANS[i] ?? 'w4'} />
          ))}
        </div>

        {/* Logo marquee — hidden until logos exist (never fake logos) */}
        {industriesConfig.logos.length > 0 && (
          <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--grey-cloud)', paddingTop: 'var(--space-xl)' }}>
            {/* TODO(client): grayscale logo marquee once logos are supplied */}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * HeroMedia — §11.2
 * Three render modes: ambient / poster / video
 * Default mode: 'ambient' (no client assets yet).
 *
 * Layer stack (video / poster modes), bottom to top:
 *   placeholder art (AmbientBackground, dark variant) → PhotoBg (generated still, fades in only
 *   once the file exists) → video (fades in only once it is actually playing) → scrim.
 *
 * Ambient: ≤6KB CSS/SVG, technical grid, slow light sweep across A+K silhouette,
 * part silhouettes with pointer parallax (desktop only, ≤6px), pauses off-screen.
 *
 * Poster: next/image full-bleed + Ken Burns (scale 1→1.04, 20s, transform only).
 * Video: injected client-side after first paint. SSR markup = poster img.
 */

'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import PhotoBg from '@/components/ui/PhotoBg';
import type { HeroMediaConfig } from '@/content/types';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

interface HeroMediaProps {
  media: HeroMediaConfig;
  /** Used to verify tone for navbar logo variant */
  'data-hero-tone'?: 'light' | 'dark';
}

/* ── Ambient mode ────────────────────────────────────────────── */
/* `dark` re-points the art's ink-on-light tokens to a night variant so the placeholder carries
   Soft White copy: same drawing, same silhouettes, dark ground. */
function AmbientBackground({ dark = false }: { dark?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const sihouettesRef = useRef<HTMLDivElement>(null);

  /* Pointer parallax for part silhouettes (desktop, ≤6px) */
  useEffect(() => {
    const silhouettes = sihouettesRef.current;
    if (!silhouettes) return;
    if (prefersReducedMotion()) return;

    const mediaQuery = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
    if (!mediaQuery.matches) return;

    const handleMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = ((e.clientX / w) - 0.5) * 6; /* ≤6px */
      const y = ((e.clientY / h) - 0.5) * 6;
      silhouettes.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  /* Pause sweep when off-screen (IntersectionObserver) */
  useEffect(() => {
    const sweep = sweepRef.current;
    const container = containerRef.current;
    if (!sweep || !container) return;

    const observer = new IntersectionObserver(([entry]) => {
      sweep.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    }, { threshold: 0 });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...(dark ? ({
          '--grey-metal': 'var(--rose-pale)',
          '--grey-warm': 'var(--rose-pale)',
          '--burgundy': 'var(--burgundy-bright)',
        } as CSSProperties) : null),
      }}
      aria-hidden="true"
    >
      {/* Canvas → surface-alt vertical wash (night variant: burgundy-night → ink) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: dark
          ? 'linear-gradient(180deg, var(--burgundy-night) 0%, var(--ink) 100%)'
          : 'linear-gradient(180deg, var(--surface-alt) 0%, var(--canvas) 100%)',
      }} />

      {/* Technical grid — fine 8px + major 64px lines, faded toward the text side */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'repeating-linear-gradient(var(--grey-metal) 0px, var(--grey-metal) 1px, transparent 1px, transparent 64px)',
          'repeating-linear-gradient(90deg, var(--grey-metal) 0px, var(--grey-metal) 1px, transparent 1px, transparent 64px)',
          'repeating-linear-gradient(var(--grey-metal) 0px, var(--grey-metal) 1px, transparent 1px, transparent 8px)',
          'repeating-linear-gradient(90deg, var(--grey-metal) 0px, var(--grey-metal) 1px, transparent 1px, transparent 8px)',
        ].join(', '),
        opacity: 0.07,
        maskImage: 'linear-gradient(100deg, transparent 5%, black 55%, black 100%)',
        WebkitMaskImage: 'linear-gradient(100deg, transparent 5%, black 55%, black 100%)',
      }} />

      {/* Diagonal metallic plate — echoes the hero's folded-sheet exit cut (§3 rule 1) */}
      <div className="hero-ambient__plate" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '46%',
        background: 'var(--metal-gradient)',
        opacity: 0.1,
        clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)',
      }} />
      <div className="hero-ambient__plate" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '46%',
        background: 'var(--burgundy)',
        opacity: 0.35,
        clipPath: 'polygon(38% 0, 38.4% 0, 0.4% 100%, 0 100%)',
      }} />

      {/* Technical drawing sheet — a generic bush/hub in section + plan, centre-lines and
          dimension arrows. Deliberately label-free: no sizes or specs are implied. */}
      <svg
        className="hero-ambient__drawing"
        style={{
          position: 'absolute',
          right: 'calc(var(--grid-page-padding) + 1%)',
          top: '62%',
          transform: 'translateY(-50%)',
          width: 'min(440px, 30vw)',
          height: 'auto',
          opacity: dark ? 0.32 : 0.55,
        }}
        viewBox="0 0 520 440"
        fill="none"
        strokeLinecap="square"
        aria-hidden="true"
      >
        {/* Sheet border + title-block ticks */}
        <rect x="8" y="8" width="504" height="424" stroke="var(--grey-warm)" strokeWidth="1" />
        <path d="M8 392 H512 M360 392 V432" stroke="var(--grey-warm)" strokeWidth="1" />

        {/* Plan view — concentric hub */}
        <circle cx="170" cy="170" r="104" stroke="var(--grey-metal)" strokeWidth="1.5" />
        <circle cx="170" cy="170" r="76" stroke="var(--grey-metal)" strokeWidth="1" />
        <circle cx="170" cy="170" r="44" stroke="var(--burgundy)" strokeWidth="1.5" />
        <circle cx="170" cy="170" r="30" stroke="var(--grey-metal)" strokeWidth="1" strokeDasharray="4 3" />
        {/* centre-lines */}
        <path d="M40 170 H300 M170 40 V300" stroke="var(--burgundy)" strokeWidth="0.75" strokeDasharray="14 4 2 4" />
        {/* bolt-circle slots */}
        <g stroke="var(--grey-metal)" strokeWidth="1">
          <circle cx="170" cy="94" r="6" /><circle cx="170" cy="246" r="6" />
          <circle cx="94" cy="170" r="6" /><circle cx="246" cy="170" r="6" />
        </g>

        {/* Side section — stepped bush profile */}
        <path d="M330 90 H450 V120 H438 V140 H450 V200 H438 V220 H450 V250 H330 Z"
          stroke="var(--grey-metal)" strokeWidth="1.5" />
        <path d="M344 100 L438 240 M360 100 L438 216 M376 100 L438 192" stroke="var(--grey-warm)" strokeWidth="1" />
        <path d="M320 170 H470" stroke="var(--burgundy)" strokeWidth="0.75" strokeDasharray="14 4 2 4" />

        {/* Dimension lines with arrowheads — no numerals */}
        <g stroke="var(--grey-metal)" strokeWidth="1">
          <path d="M66 300 V316 M274 300 V316 M66 310 H274" />
          <path d="M66 310 l10 -4 v8 z M274 310 l-10 -4 v8 z" fill="var(--grey-metal)" />
          <path d="M456 90 H476 M456 250 H476 M470 90 V250" />
          <path d="M470 90 l-4 10 h8 z M470 250 l-4 -10 h8 z" fill="var(--grey-metal)" />
        </g>
        {/* Section marker */}
        <g stroke="var(--burgundy)" strokeWidth="1.25">
          <path d="M300 170 H320" /><path d="M300 150 V190" />
        </g>
      </svg>

      {/* Part silhouettes — stroke only, pointer-parallax layer (hidden on small screens) */}
      <div ref={sihouettesRef} className="hero-ambient__parts" style={{
        position: 'absolute',
        inset: 0,
        transition: 'transform 200ms cubic-bezier(.16,1,.3,1)',
        willChange: 'transform',
      }}>
        <svg style={{ position: 'absolute', left: '46%', bottom: '24%', opacity: 0.22, width: 56, height: 56 }}
          viewBox="0 0 48 48" fill="none" stroke="var(--grey-metal)" strokeWidth="1.25" strokeLinecap="square">
          <rect x="14" y="20" width="16" height="14" />
          <path d="M 6 27 L 14 27 M 30 27 L 38 27" />
          <path d="M 22 20 L 22 14 L 36 8" />
          <circle cx="36" cy="8" r="6" />
        </svg>
        <svg style={{ position: 'absolute', right: '8%', bottom: '22%', opacity: 0.22, width: 48, height: 48 }}
          viewBox="0 0 48 48" fill="none" stroke="var(--grey-metal)" strokeWidth="1.25" strokeLinecap="square">
          <rect x="14" y="10" width="20" height="28" />
          <rect x="8" y="16" width="6" height="16" />
          <path d="M 24 6 L 24 42" strokeDasharray="3 3" />
        </svg>
        <svg style={{ position: 'absolute', left: '52%', top: '16%', opacity: 0.22, width: 52, height: 52 }}
          viewBox="0 0 48 48" fill="none" stroke="var(--grey-metal)" strokeWidth="1.25" strokeLinecap="square">
          <rect x="8" y="8" width="32" height="32" />
          <path d="M 16 8 L 16 40 M 24 8 L 24 40 M 32 8 L 32 40" />
          <path d="M 8 16 L 40 16 M 8 24 L 40 24 M 8 32 L 40 32" />
        </svg>
      </div>

      {/* Light sweep — 45° white band, ONE 1200ms expo.inOut pass after the entrance, lower-left → upper-right */}
      <div
        ref={sweepRef}
        className="hero-ambient__sweep"
        style={{
          position: 'absolute',
          inset: '-50%',
          background: `linear-gradient(45deg, transparent 35%, color-mix(in srgb, var(--surface) ${dark ? 14 : 35}%, transparent) 50%, transparent 65%)`,
          /* parked off the sheet; Hero adds .hero--in and the single 1200ms pass runs (CSS in Hero.tsx) */
          transform: 'translate(-60%, 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Sweep keyframes — injected as a style tag to avoid needing a CSS file */}
      <style>{`
        @keyframes hero-sweep {
          from { transform: translate(-60%, 60%); }
          to   { transform: translate(60%, -60%); }
        }
        @media (max-width: 767px) {
          .hero-ambient__drawing { right: -18% !important; width: 78vw !important; opacity: 0.16 !important; top: auto !important; bottom: -4% !important; transform: none !important; }
          .hero-ambient__parts { display: none; }
        }
        @media (prefers-reduced-motion: reduce) { .hero-ambient__sweep { animation: none !important; } }
      `}</style>
    </div>
  );
}

/* ── Poster mode ─────────────────────────────────────────────── */
function PosterBackground({ src, alt }: { src: string; alt?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* PhotoBg: invisible until decoded, renders nothing if the file is missing (no broken-image icon) */}
      <div
        className="hero-ken"
        style={{
          position: 'absolute',
          inset: 0,
          /* Very slow Ken Burns — scale 1→1.04 over 20s, transform only */
          animation: 'ken-burns 20s cubic-bezier(.65,0,.35,1) infinite alternate',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <PhotoBg src={src} alt={alt ?? ''} priority width={1920} height={1080} />
      </div>
      <style>{`
        @media (prefers-reduced-motion: reduce) { .hero-ken { animation: none !important; } }
        @keyframes ken-burns {
          from { transform: scale(1); }
          to   { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

/* ── Video mode ──────────────────────────────────────────────── */
function VideoBackground({ webm, mp4, poster }: { webm?: string | null; mp4?: string | null; poster?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying] = useState(true); // pause/play button removed; video autoplays + loops
  /* the video stays invisible until it is genuinely playing, so a missing / failed file never
     paints a black box over the photo and placeholder art underneath */
  const [live, setLive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Inject video client-side after first paint (§11.2 — never competes with LCP) */
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration mount flag
  useEffect(() => { setMounted(true); }, []);

  /* No autoplay < 768px, coarse pointer or reduced motion (§11.2) */
  const canAutoplay = mounted &&
    window.innerWidth >= 768 &&
    matchMedia('(pointer: fine)').matches &&
    !prefersReducedMotion();

  /* Pause when off-screen */
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (isPlaying) video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0 });

    io.observe(container);

    /* Pause on visibilitychange */
    const handleVisibility = () => {
      if (document.hidden) video.pause();
      else if (isPlaying) video.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isPlaying, canAutoplay]);


  /* SSR: show poster img (LCP); the photo layer and placeholder art sit underneath either way */
  if (!mounted) {
    return poster ? (
      <div style={{ position: 'absolute', inset: 0 }}>
        <PhotoBg src={poster} priority width={1920} height={1080} />
      </div>
    ) : null;
  }

  if (!canAutoplay) return poster ? <PosterBackground src={poster} /> : null;

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        aria-hidden="true"
        tabIndex={-1}
        width={1920}
        height={1080}
        onPlaying={() => setLive(true)}
        onError={() => setLive(false)}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          opacity: live ? 1 : 0, transition: 'opacity 600ms ease',
        }}
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
      </video>
    </div>
  );
}

/* ── Scrim (video + poster modes) ──────────────────────────────
   The copy is one left-aligned block anchored bottom-left (headline, sub, tagline, CTAs, rail).
   Instead of a stack of per-glyph text shadows, the legibility is a soft local scrim behind that
   zone, built from --ink only so it can never drift off the brand's warm near-black:

     zone    two gradients that composite into a bottom-left pool of shade: one rises from the
             bottom edge (also seats the rail and the exit diagonal), one runs in from the left edge
             and clears to nothing past ~90% so the right of frame stays open and the footage reads.
             The strengths are set for blown highlights (up to ~0.78 relative luminance) under
             Soft White copy at 88%+ opacity: every stop keeps the small labels >= 4.5:1.
     mask    keeps the nav band (pill = 16px + 64px) clear, so the light glass sits on open footage

   Below 768px the copy spans the full width, so the horizontal falloff is dropped for a plain
   bottom-up gradient that is deep behind the text and eases off above the headline. */
const SCRIM_CSS = `
.hero-scrim { position: absolute; inset: 0; pointer-events: none; }
.hero-scrim__zone { position: absolute; inset: 0;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 84px, var(--ink) 132px);
          mask-image: linear-gradient(to bottom, transparent 0, transparent 84px, var(--ink) 132px);
  background:
    linear-gradient(to top,
      color-mix(in srgb, var(--ink) 84%, transparent) 0%,
      color-mix(in srgb, var(--ink) 66%, transparent) 30%,
      color-mix(in srgb, var(--ink) 30%, transparent) 58%,
      transparent 84%),
    linear-gradient(97deg,
      color-mix(in srgb, var(--ink) 74%, transparent) 0%,
      color-mix(in srgb, var(--ink) 62%, transparent) 36%,
      color-mix(in srgb, var(--ink) 38%, transparent) 56%,
      color-mix(in srgb, var(--ink) 12%, transparent) 74%,
      transparent 92%); }
/* flat burgundy wash. Deliberately NOT mix-blend-mode: overlay — that mode pushes
   the footage's own highlights further up, so bright frames bloom behind the text. */
.hero-scrim__tint { position: absolute; inset: 0; background: var(--burgundy); opacity: .06; }
.hero-scrim__grain { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .04; }

@media (max-width: 767px) {
  .hero-scrim__zone { background: linear-gradient(to top,
    color-mix(in srgb, var(--ink) 90%, transparent) 0%,
    color-mix(in srgb, var(--ink) 80%, transparent) 40%,
    color-mix(in srgb, var(--ink) 62%, transparent) 72%,
    color-mix(in srgb, var(--ink) 30%, transparent) 100%); }
}
`;

function Scrim() {
  return (
    <>
      <style>{SCRIM_CSS}</style>
      <div className="hero-scrim" aria-hidden="true">
        <div className="hero-scrim__zone" />
        <div className="hero-scrim__tint" />
        {/* film grain — static, kills banding across the gradient stops */}
        <svg className="hero-scrim__grain" aria-hidden="true">
          <filter id="hero-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>
      </div>
    </>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function HeroMedia({ media }: HeroMediaProps) {
  /* Determine render mode */
  const hasVideo = !!(media.video?.webm || media.video?.mp4);
  const hasPoster = !!media.poster;
  const isReducedMotion = typeof window !== 'undefined' ? prefersReducedMotion() : false;

  let resolvedMode = media.mode;
  if (resolvedMode === 'auto') {
    if (hasVideo && !isReducedMotion) resolvedMode = 'video';
    else if (hasPoster) resolvedMode = 'poster';
    else resolvedMode = 'ambient';
  }

  const showScrim = resolvedMode === 'video' || resolvedMode === 'poster';
  /* the video's own poster falls back to the generated photo */
  const videoPoster = media.poster ?? media.photo ?? null;

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      data-hero-tone={media.tone ?? 'light'}
    >
      {/* 1 · placeholder art — always present, night variant when the copy is Soft White */}
      <AmbientBackground dark={showScrim && media.tone === 'dark'} />
      {/* 2 · generated photograph — fades in once the file exists, renders nothing if it does not */}
      {showScrim && media.photo && (
        <PhotoBg src={media.photo} priority width={1920} height={1080} position="center" />
      )}
      {/* 3 · video / poster — only when it plays / exists */}
      {resolvedMode === 'poster' && media.poster && <PosterBackground src={media.poster} />}
      {resolvedMode === 'video' && (
        <VideoBackground
          webm={media.video?.webm}
          mp4={media.video?.mp4}
          poster={videoPoster}
        />
      )}
      {/* 4 · scrim */}
      {showScrim && <Scrim />}
    </div>
  );
}

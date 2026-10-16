/**
 * Preloader lab client — controls for testing the preloader sequence.
 * §10.5: Replay / Slow-mo ×0.25 / Reduced-motion emulation / Step through beats
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SESSION_KEY, markPreloaderDone } from '@/lib/preload';

const Preloader = dynamic(() => import('@/components/preloader/Preloader'), { ssr: false });

type Mode = 'hidden' | 'playing' | 'done';

const BEATS = [
  { name: 'Sheet', time: 0 },
  { name: 'Construction — A', time: 0.15 },
  { name: 'L+O Lock', time: 0.45 },
  { name: 'K Arm', time: 0.7 },
  { name: 'Light sweep', time: 1.1 },
  { name: 'PLASTICS', time: 1.3 },
  { name: 'Inscription', time: 1.65 },
  { name: 'Exit', time: 2.6 },
];

export default function PreloaderLabClient() {
  const [mode, setMode] = useState<Mode>('hidden');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [key, setKey] = useState(0); /* forces remount on replay */
  const [currentBeat, setCurrentBeat] = useState(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const handleReplay = useCallback(() => {
    /* Clear session so shouldShowPreloader() returns true */
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
    setCurrentBeat(0);
    setMode('playing');
    setKey(k => k + 1);
  }, []);

  const handleSlowMo = useCallback(() => {
    if (timelineRef.current) {
      const current = timelineRef.current.timeScale();
      timelineRef.current.timeScale(current === 0.25 ? 1 : 0.25);
    }
  }, []);

  const handleStep = useCallback(() => {
    if (!timelineRef.current) return;
    const nextBeat = BEATS[currentBeat + 1];
    if (!nextBeat) return;
    timelineRef.current.seek(nextBeat.time, false);
    timelineRef.current.pause();
    setCurrentBeat(b => b + 1);
  }, [currentBeat]);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(v => {
      /* Emulate by setting/removing a meta tag the hook reads */
      const exists = document.head.querySelector('[data-reduced-motion-override]');
      if (!v) {
        if (!exists) {
          const style = document.createElement('style');
          style.setAttribute('data-reduced-motion-override', '');
          style.textContent = '@media (prefers-reduced-motion: no-preference) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }';
          document.head.appendChild(style);
        }
      } else {
        exists?.remove();
      }
      return !v;
    });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
        Preloader Lab
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        §10.5 — Test the construction sequence. Preloader runs in a viewport overlay.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          onClick={handleReplay}
          style={{ background: 'var(--burgundy)', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 2, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Replay
        </button>
        <button
          onClick={handleSlowMo}
          style={{ background: 'var(--surface)', color: 'var(--burgundy)', border: '1px solid var(--burgundy)', padding: '0.5rem 1.25rem', borderRadius: 2, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Slow-mo ×0.25
        </button>
        <button
          onClick={handleStep}
          disabled={mode !== 'playing'}
          style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--grey-warm)', padding: '0.5rem 1.25rem', borderRadius: 2, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: mode !== 'playing' ? 0.5 : 1 }}
        >
          Step → {BEATS[currentBeat + 1]?.name ?? 'done'}
        </button>
        <button
          onClick={toggleReducedMotion}
          style={{ background: reducedMotion ? 'var(--surface-alt)' : 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--grey-warm)', padding: '0.5rem 1.25rem', borderRadius: 2, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {reducedMotion ? '✓ ' : ''}Reduced motion
        </button>
      </div>

      {/* Beat timeline */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--grey-metal)', fontWeight: 600, marginBottom: '0.5rem' }}>
          Construction beats
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {BEATS.map((beat, i) => (
            <div key={beat.name} style={{
              padding: '4px 10px',
              borderRadius: 2,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              background: i === currentBeat ? 'var(--burgundy)' : 'var(--surface-alt)',
              color: i === currentBeat ? 'white' : 'var(--muted)',
              border: '1px solid ' + (i === currentBeat ? 'var(--burgundy)' : 'var(--grey-warm)'),
            }}>
              {beat.name} ({beat.time}s)
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        Status: {mode === 'hidden' ? 'Click Replay to start' : mode === 'playing' ? 'Playing…' : 'Done'}
        {reducedMotion && ' · REDUCED MOTION MODE'}
      </div>

      {/* Notes */}
      <div style={{ background: 'var(--blush)', borderLeft: '4px solid var(--burgundy)', padding: '1rem', borderRadius: 2, fontSize: '0.875rem', color: 'var(--body)' }}>
        <strong style={{ color: 'var(--ink)' }}>Note:</strong> The preloader uses a placeholder Logo component until the client supplies
        the vector logo at <code>/brand/alok-logo-primary.png</code>. The GSAP clip-path
        reveals target named SVG elements (#A-ribbon, #LO-core, #K-arm) which will work
        correctly once the Logo is traced from the real artwork.
      </div>

      {/* Preloader instance */}
      {mode === 'playing' && (
        <Preloader
          key={key}
          onComplete={() => {
            markPreloaderDone();
            setMode('done');
          }}
        />
      )}
    </div>
  );
}

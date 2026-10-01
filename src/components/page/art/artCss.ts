/**
 * Shared hero-art motion helpers (CSS only; transform / opacity / clip-path / stroke-dashoffset).
 * Base state = final visible state, so reduced-motion (animation: none) needs no special casing.
 * Usage: SVG shapes get pathLength={1} + className="pa-draw" and --d (ms delay) via style.
 */
import type { CSSProperties } from 'react';

export const ART_CSS = `
.pa-draw { stroke-dasharray: 1; stroke-dashoffset: 0; animation: pa-draw 1200ms calc(var(--d, 0) * 1ms) cubic-bezier(.65,0,.35,1) backwards; }
.pa-fade { animation: pa-fade 700ms calc(var(--d, 0) * 1ms) cubic-bezier(.16,1,.3,1) backwards; }
.pa-rise { animation: pa-rise 900ms calc(var(--d, 0) * 1ms) cubic-bezier(.16,1,.3,1) backwards; }
@keyframes pa-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes pa-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pa-rise { from { opacity: 0; transform: translate3d(0, 24px, 0); } to { opacity: 1; transform: none; } }
.pa-svg { display: block; overflow: visible; }
.pa-mono { font-family: var(--font-mono, monospace); letter-spacing: 0.08em; }
`;

/** Animation delay (ms) as a CSS custom property. */
export const D = (ms: number): CSSProperties => ({ ['--d' as string]: ms }) as CSSProperties;

/**
 * /lab/preloader — Preloader development page
 * Controls: Replay · Slow-mo ×0.25 · Reduced-motion · Step through beats
 * §10.5 deliverable.
 */

import type { Metadata } from 'next';
import PreloaderLabClient from './PreloaderLabClient';

export const metadata: Metadata = {
  title: '_lab / preloader',
  robots: { index: false, follow: false },
};

export default function PreloaderLabPage() {
  return <PreloaderLabClient />;
}

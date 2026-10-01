/**
 * Reveal: scroll-in entrance wrapper (transform / opacity / clip-path only).
 * Variants: rise (fade + lift) | wipe (44-degree diagonal) | draw (scaleX rule) | mask (clip rise).
 * Elements already in view on mount are left alone; below-the-fold ones are hidden by JS
 * and revealed once. No JS or reduced-motion: always visible.
 */
'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import './reveal.css';

interface Props {
  as?: ElementType;
  variant?: 'rise' | 'wipe' | 'draw' | 'mask';
  delay?: number;       // ms
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export default function Reveal({ as: Tag = 'div', variant = 'rise', delay = 0, className, style, children }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.dataset.rv = 'hide';
    /* Scroll check instead of IntersectionObserver: clip-path'd targets report zero intersection. */
    let raf = 0;
    const check = () => {
      raf = 0;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
        el.dataset.rv = 'show';
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <Tag ref={ref} data-rvv={variant} className={className} style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}>
      {children}
    </Tag>
  );
}

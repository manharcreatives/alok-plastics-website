'use client';
/**
 * ProductGallery — main image + thumbnails (desktop), swipe track + dots (mobile), a hover
 * zoom, and a solid lightbox (arrows, Esc, focus trap). Photos an owner uploads in the admin are shown
 * as a gallery. Otherwise the slot shows the part's pictogram on a drawing sheet with the product photo
 * (/images/products/<slug>.webp, 1:1) fading in over it once the file exists. Never fakes a photo.
 * No gallery library: CSS scroll-snap does the swiping.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/content/types';
import { PartArt } from './PartCard';
import PhotoBg from '@/components/ui/PhotoBg';
import { productPhoto } from '@/content/products';
import { useRuntimeProduct } from '@/components/runtime/useRuntime';
import './products.css';
import './pdp.css';

function Lightbox({ imgs, start, name, onClose }: { imgs: Product['images']; start: number; name: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const box = useRef<HTMLDivElement>(null);
  const n = imgs.length;
  const go = useCallback((d: number) => setI(v => (v + d + n) % n), [n]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    box.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); return; }
      if (e.key !== 'Tab' || !box.current) return;
      const f = Array.from(box.current.querySelectorAll<HTMLElement>('button:not([disabled])'));
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [go, onClose]);

  const cur = imgs[Math.min(i, n - 1)];
  return (
    <div ref={box} className="p-lb" role="dialog" aria-modal="true" aria-label={`${name}, image viewer`} data-lenis-prevent>
      <div className="p-lb__bar">
        <span className="p-lb__count" aria-live="polite">{i + 1} / {n}</span>
        <button type="button" className="p-lb__btn" onClick={onClose} aria-label="Close image viewer">Close</button>
      </div>
      <div className="p-lb__stage">
        {n > 1 && <button type="button" className="p-lb__btn p-lb__nav" onClick={() => go(-1)} aria-label="Previous image">Prev</button>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.src} alt={cur.alt} />
        {n > 1 && <button type="button" className="p-lb__btn p-lb__nav" onClick={() => go(1)} aria-label="Next image">Next</button>}
      </div>
    </div>
  );
}

export default function ProductGallery({ product: base }: { product: Product }) {
  const product = useRuntimeProduct(base);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const track = useRef<HTMLUListElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const imgs = product.images;
  const close = useCallback(() => setOpen(false), []);

  if (imgs.length === 0) {
    const photo = productPhoto(product);
    return (
      <div className="p-gallery">
        <div className="p-gallery__main p-gallery__plate">
          <div className="p-ph">
            <span className="p-ph__frame" aria-hidden="true" />
            <span aria-hidden="true" style={{ position: 'relative', display: 'contents' }}><PartArt product={product} photo={false} /></span>
            <span className="p-fine" style={{ position: 'relative' }}>Product photo coming soon</span>
            <span className="p-ph__sub" style={{ position: 'relative' }}>Need a photo or drawing? Ask us.</span>
          </div>
          {photo && <PhotoBg src={photo} alt={`${product.name}, Alok Plastics`} width={1200} height={1200} priority />}
        </div>
      </div>
    );
  }

  const idx = Math.min(i, imgs.length - 1);
  const cur = imgs[idx];

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onScroll = () => {
    const t = track.current;
    if (!t) return;
    const next = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
    if (next !== i) setI(Math.max(0, Math.min(imgs.length - 1, next)));
  };
  const jump = (n: number) => {
    setI(n);
    const t = track.current;
    if (t) t.scrollTo({ left: n * t.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="p-gallery">
      {/* desktop: one image, hover zoom, click opens the viewer */}
      <button
        ref={trigger}
        type="button"
        className="p-gallery__main p-gallery__zoom"
        onClick={() => setOpen(true)}
        onPointerMove={onMove}
        onPointerLeave={() => setZoom(null)}
        aria-label={`Enlarge image ${idx + 1} of ${imgs.length}: ${cur.alt}`}
        aria-haspopup="dialog"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cur.src}
          alt=""
          width={cur.w || undefined}
          height={cur.h || undefined}
          className="p-gallery__img"
          style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </button>

      {/* mobile: native swipe */}
      <div className="p-swipe">
        <ul ref={track} className="p-swipe__track" onScroll={onScroll} aria-label="Product images, swipe to browse">
          {imgs.map((im, n) => (
            <li key={im.src} className="p-swipe__slide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.alt} width={im.w || undefined} height={im.h || undefined} loading={n === 0 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
        {imgs.length > 1 && (
          <div className="p-dots" role="group" aria-label="Choose image">
            {imgs.map((im, n) => (
              <button key={im.src} type="button" className="p-dot" aria-current={n === idx} aria-label={`Image ${n + 1} of ${imgs.length}`} onClick={() => jump(n)} />
            ))}
          </div>
        )}
      </div>

      {imgs.length > 1 && (
        <ul className="p-thumbs" aria-label="Product images">
          {imgs.map((im, n) => (
            <li key={im.src}>
              <button type="button" className="p-thumb" aria-current={n === idx} aria-label={`Show image ${n + 1} of ${imgs.length}`} onClick={() => setI(n)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Lightbox imgs={imgs} start={idx} name={product.name} onClose={close} />}
    </div>
  );
}

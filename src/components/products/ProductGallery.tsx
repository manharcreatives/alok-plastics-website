'use client';
/**
 * ProductGallery — real photos when supplied; otherwise a technical-drawing
 * placeholder ("Product photo coming soon"). Never fakes a photo.
 */
import { useState } from 'react';
import type { Product } from '@/content/types';
import { PartArt } from './PartCard';
import './products.css';

export default function ProductGallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const imgs = product.images;

  if (imgs.length === 0) {
    return (
      <div className="p-gallery">
        <div className="p-gallery__main" role="img" aria-label={`${product.name} — product photo coming soon`}>
          <div className="p-ph">
            <span className="p-ph__frame" aria-hidden="true" />
            <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, color: 'var(--grey-warm)' }} fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M200 24V276M24 150H376" strokeDasharray="10 4 2 4" />
              <path d="M56 232H344M56 224V240M344 224V240" />
            </svg>
            <span style={{ position: 'relative', color: 'var(--burgundy)' }}><PartArt product={product} /></span>
            <span className="p-ph__cap" style={{ position: 'relative' }}>Product photo coming soon</span>
            <span className="p-ph__sub" style={{ position: 'relative' }}>Need a photo or drawing? Ask us.</span>
          </div>
        </div>
      </div>
    );
  }

  const cur = imgs[Math.min(i, imgs.length - 1)];
  return (
    <div className="p-gallery">
      <div className="p-gallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.src} alt={cur.alt} width={cur.w} height={cur.h} />
      </div>
      {imgs.length > 1 && (
        <ul className="p-thumbs" aria-label="Product images">
          {imgs.map((im, idx) => (
            <li key={im.src}>
              <button type="button" className="p-thumb" aria-current={idx === i} aria-label={`Show image ${idx + 1} of ${imgs.length}`} onClick={() => setI(idx)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';
/**
 * ProductGallery — real photos when supplied. Until then the photo slot shows the part's
 * pictogram large on a drawing sheet, honestly captioned. Never fakes a photo.
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
        <div className="p-gallery__main" role="img" aria-label={`${product.name}, drawn illustration. Product photo coming soon.`}>
          <div className="p-ph">
            <span className="p-ph__frame" aria-hidden="true" />
            <span style={{ position: 'relative', display: 'contents' }}><PartArt product={product} /></span>
            <span className="p-fine" style={{ position: 'relative' }}>Product photo coming soon</span>
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

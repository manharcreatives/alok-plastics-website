'use client';

import { useEffect } from 'react';

/** Loads the product form's progressive enhancements (character counters, Google preview, image reordering) each time the form is shown. */
export default function ProductsEnhance() {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = `/admin/assets/products.js?v=2&t=${Date.now()}`;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);
  return null;
}

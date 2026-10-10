/**
 * Background photos for each guide. Every guide sits on a light wash over four catalogue product
 * photos chosen for its subject, so the page reads as Alok's own parts and nothing is invented.
 * Keys are blog slugs from src/content/blogs.ts; values are file names in /public/images/products.
 */
import type { CSSProperties } from 'react';

const PRODUCT_SETS: Record<string, string[]> = {
  'water-cooler-float-valve-overflow-leakage': ['float-valve', 'push-cock', 'waste-pipe', 'waste-coupling'],
  'display-counter-sliding-door-parts-guide': ['f-bush', 'handle-lock', 'door-lock', 'bracket-handle'],
  'hdpe-nylon-ppcp-brass-cooler-spare-parts': ['adjustable-leg-insert', 'ventilation-jalli', 'connecting-bush', 'push-cock'],
  'deep-freezer-door-gasket-hinge-replacement-guide': ['gasket', 'l-type-hinge', 'u-type-door-spring', 'l-hinge-door-spring'],
  'custom-plastic-moulded-parts-sample-to-supply': ['three-core-plug', 'bright-chrome', 'waste-coupling', 'adjustable-leg-insert'],
};

/** Inline custom properties (--bl-img-1 … --bl-img-4) consumed by BlogBgPage's CSS. */
export function blogBgStyle(slug: string): CSSProperties {
  const style: Record<string, string> = {};
  (PRODUCT_SETS[slug] ?? []).slice(0, 4).forEach((name, i) => {
    style[`--bl-img-${i + 1}`] = `url(/images/products/${name}.webp)`;
  });
  return style as CSSProperties;
}

'use client';

import { useCallback, useState } from 'react';

/**
 * PhotoBg — a real photograph layered OVER an existing artistic placeholder.
 *
 * The parent supplies the placeholder (SVG art / gradient / illustration) as siblings or
 * background and positions this component absolutely. The photo fades in only after it has
 * decoded; if the file is missing or fails, the component renders nothing and the placeholder
 * underneath stays visible. Never remove the placeholder when adding a photo.
 *
 * Decorative by default (alt=""), pass `alt` for meaningful imagery.
 */
export interface PhotoBgProps {
  src: string;
  alt?: string;
  /** CSS object-position, default center */
  position?: string;
  /** Final opacity once loaded (0–1). Use <1 for shaded/quiet backdrops. */
  opacity?: number;
  /** 'eager' for above-the-fold heroes */
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function PhotoBg({
  src,
  alt = '',
  position = 'center',
  opacity = 1,
  priority = false,
  className,
  width,
  height,
}: PhotoBgProps) {
  const [state, setState] = useState<'idle' | 'loaded' | 'failed'>('idle');
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) setState(el.naturalWidth > 0 ? 'loaded' : 'failed');
  }, []);

  if (state === 'failed') return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      aria-hidden={alt ? undefined : true}
      className={className ? `photo-bg ${className}` : 'photo-bg'}
      data-loaded={state === 'loaded' ? 'true' : 'false'}
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: position,
        opacity: state === 'loaded' ? opacity : 0,
        transition: 'opacity 600ms ease',
        pointerEvents: 'none',
      }}
    />
  );
}

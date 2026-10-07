/**
 * Mobile drawer — §9.3
 * Glass background (ONE of the two allowed backdrop-filter elements, §9).
 * Enters along a diagonal clip-path (K angle ~44°).
 * Focus trap, inert on rest of page, data-lenis-prevent.
 *
 * Note: backdrop-filter is applied inline to avoid needing a CSS import
 * (glass-nav.css is the other file; combined = 2 files total, within limit).
 *
 * Products row: the label navigates to /products/; a separate chevron button expands the five
 * categories inline (accordion). aria-expanded / aria-controls live on the chevron.
 *
 * Round 2: WhatsApp CTA removed (WhatsApp lives only in the floating button);
 * Phosphor Light icons; the active page is marked by a plain burgundy rule, the
 * same language as the desktop nav.
 */

'use client';

import { useEffect, useRef, useCallback, useId, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Phone } from '@phosphor-icons/react/dist/csr/Phone';
import Logo from '@/components/brand/Logo';
import { navigation } from '@/content/navigation';
import { productGroups } from '@/content/products';
import { site } from '@/content/site';
import { useRuntimeContact } from '@/components/runtime/useRuntime';
import { isActivePath } from './isActivePath';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DRAWER_CSS = `
.drawer-panel { animation: drawer-in 700ms cubic-bezier(.16,1,.3,1) both; }
@keyframes drawer-in {
  from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); }
  to   { clip-path: polygon(24px 0, 100% 0, 100% 100%, 0 100%); }
}
.drawer-link { position: relative; display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0 16px 0; border-bottom: 1px solid var(--grey-cloud); color: var(--ink);
  font-size: 1.0625rem; font-weight: 500; text-decoration: none; transition: color 200ms cubic-bezier(.16,1,.3,1), padding-left 400ms cubic-bezier(.16,1,.3,1); }
.drawer-link:hover, .drawer-link:focus-visible { color: var(--burgundy); }
.drawer-link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.drawer-link--active { color: var(--burgundy); font-weight: 600; padding-left: 24px; }
.drawer-link__notch { position: absolute; left: 6px; top: 50%; width: 2px; height: 20px; margin-top: -10px;
  background: var(--burgundy); transform: scaleY(0); transform-origin: 50% 50%;
  transition: transform 400ms var(--ease-expo-out); }
.drawer-link--active .drawer-link__notch { transform: scaleY(1); }
.drawer-link__arrow { color: var(--muted); transition: transform 200ms cubic-bezier(.16,1,.3,1); }
.drawer-link:hover .drawer-link__arrow { transform: translate3d(2px,-2px,0); }
.drawer-row { display: flex; align-items: stretch; border-bottom: 1px solid var(--grey-cloud); }
.drawer-row .drawer-link { flex: 1; border-bottom: 0; }
.drawer-expand { flex-shrink: 0; width: 48px; display: flex; align-items: center; justify-content: center; background: none;
  border: 0; border-left: 1px solid var(--grey-cloud); color: var(--ink); cursor: pointer;
  transition: color 200ms cubic-bezier(.16,1,.3,1), background-color 200ms cubic-bezier(.16,1,.3,1); }
.drawer-expand:hover, .drawer-expand:focus-visible, .drawer-expand[aria-expanded='true'] { color: var(--burgundy); background: var(--blush); }
.drawer-expand:focus-visible { outline: 2px solid var(--burgundy); outline-offset: -2px; }
.drawer-expand svg { transition: transform 400ms cubic-bezier(.16,1,.3,1); }
.drawer-expand[aria-expanded='true'] svg { transform: rotate(180deg); }
.drawer-sub { list-style: none; margin: 0; padding: 0 0 var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--grey-cloud); }
.drawer-sub__link { display: flex; align-items: center; justify-content: space-between; min-height: 44px; padding: 8px var(--space-xs) 8px var(--space-sm);
  border-left: 2px solid var(--pink-soft); color: var(--body); font-size: 0.9375rem; text-decoration: none;
  transition: color 200ms cubic-bezier(.16,1,.3,1), border-color 200ms cubic-bezier(.16,1,.3,1); }
.drawer-sub__link:hover, .drawer-sub__link:focus-visible { color: var(--burgundy); border-left-color: var(--burgundy); }
.drawer-sub__link:focus-visible { outline: 2px solid var(--burgundy); outline-offset: 2px; }
.drawer-cta { --cut: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px;
  color: var(--surface); background: var(--burgundy); font-weight: 600; font-size: 1rem; text-decoration: none;
  clip-path: polygon(0 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut))); }
.drawer-cta:hover, .drawer-cta:focus-visible { background: var(--burgundy-deep); }
.drawer-call { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px;
  background: var(--surface); color: var(--ink); font-weight: 500; font-size: 1rem; text-decoration: none;
  border: 1px solid var(--grey-warm); border-radius: var(--radius-card); }
.drawer-call:hover, .drawer-call:focus-visible { border-color: var(--burgundy); color: var(--burgundy); }
@media (prefers-reduced-motion: reduce) {
  .drawer-panel { animation: none; }
  .drawer-link, .drawer-link__notch, .drawer-link__arrow, .drawer-expand, .drawer-expand svg, .drawer-sub__link { transition: none; }
}
`;

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const pathname = usePathname();
  const [productsOpen, setProductsOpen] = useState(false);
  const subId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /* Panel value for the call button, null until settings.json arrives. */
  const { phone } = useRuntimeContact();

  /* Focus trap + Esc */
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    /* Body inert + lenis-prevent when drawer is open */
    const main = document.querySelector('main');
    main?.setAttribute('inert', '');
    main?.setAttribute('data-lenis-prevent', '');

    /* Move focus to close button */
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusables = drawer.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      main?.removeAttribute('inert');
      main?.removeAttribute('data-lenis-prevent');
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30,17,21,0.25)',
        zIndex: 55,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    >
      <style>{DRAWER_CSS}</style>
      {/* Drawer panel — glass, enters from the right along the K-angle clip-path */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        data-lenis-prevent
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(360px, 90vw)',
          /* Glass — §9: second and only other allowed backdrop-filter */
          background: 'rgba(248,247,247,0.88)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderLeft: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '-8px 0 40px rgba(30,17,21,0.12)',
          clipPath: 'polygon(24px 0, 100% 0, 100% 100%, 0 100%)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 56,
          overflowY: 'auto',
          padding: 'var(--space-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-lg)',
        }}>
          <Link href="/" onClick={onClose} aria-label="Alok Plastics home">
            <Logo variant="color" lockup="full" style={{ height: 32, width: 'auto' }} />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid var(--grey-warm)',
              borderRadius: 'var(--radius-card)',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            <X weight="light" size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Main navigation">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navigation.primary.map(item => {
              const active = isActivePath(pathname, item.href);
              const isProducts = item.label === 'Products';
              const link = (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`drawer-link${active ? ' drawer-link--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="drawer-link__notch" aria-hidden="true" />
                  {item.label}
                  <ArrowUpRight weight="light" size={18} aria-hidden="true" className="drawer-link__arrow" />
                </Link>
              );
              if (!isProducts) return <li key={item.href}>{link}</li>;
              return (
                <li key={item.href}>
                  <div className="drawer-row">
                    {link}
                    <button
                      type="button"
                      className="drawer-expand"
                      aria-expanded={productsOpen}
                      aria-controls={subId}
                      aria-label="Product categories"
                      onClick={() => setProductsOpen(v => !v)}
                    >
                      <CaretDown weight="light" size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <ul id={subId} className="drawer-sub" hidden={!productsOpen}>
                    {productGroups.map(g => (
                      <li key={g.id}>
                        <Link href={`/products/${g.slug}/`} onClick={onClose} className="drawer-sub__link">
                          {g.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTAs */}
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Link href="/enquiry" onClick={onClose} className="drawer-cta">
            Get a Quote
            <ArrowUpRight weight="light" size={18} aria-hidden="true" />
          </Link>

          {phone && (
            <a href={`tel:${phone}`} className="drawer-call">
              <Phone weight="light" size={18} aria-hidden="true" />
              Call: {phone}
            </a>
          )}
        </div>

        {/* Tagline at bottom — §9.3 */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-lg)', textAlign: 'center' }}>
          <p lang="sa" style={{
            fontFamily: 'var(--font-devanagari, sans-serif)',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--ink)',
            margin: 0,
          }}>
            {site.tagline.devanagari}
          </p>
          <p lang="en" style={{
            fontSize: '0.8125rem',
            color: 'var(--muted)',
            margin: '4px 0 0',
          }}>
            {site.tagline.english}
          </p>
        </div>
      </div>
    </div>
  );
}

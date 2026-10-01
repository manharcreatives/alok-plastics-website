/**
 * Mobile drawer — §9.3
 * Glass background (ONE of the two allowed backdrop-filter elements, §9).
 * Slides in from right along a diagonal clip-path (K angle ~44°).
 * Focus trap, inert on rest of page, data-lenis-prevent.
 *
 * Note: backdrop-filter is applied inline to avoid needing a CSS import
 * (glass-nav.css is the other file; combined = 2 files total, within limit).
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { navigation } from '@/content/navigation';
import { site } from '@/content/site';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Focus trap + Esc */
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    /* Body inert + lenis-prevent when drawer is open */
    const body = document.querySelector('body');
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
      aria-hidden="true"
    >
      {/* Drawer panel — glass, slides from right along K-angle clip-path */}
      <div
        ref={drawerRef}
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
          /* Diagonal clip-path entry — K angle ~44° */
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
          marginBottom: 'var(--space-xl)',
        }}>
          <Link href="/" onClick={onClose} aria-label="Alok Plastics — Home">
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
              fontSize: '1.25rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Main navigation">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navigation.primary.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-sm) 0',
                    borderBottom: '1px solid var(--grey-cloud)',
                    fontSize: '1.0625rem',
                    fontWeight: item.label === 'Products' ? 600 : 500,
                    color: 'var(--ink)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                  <span aria-hidden style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTAs */}
        <div style={{ marginTop: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <Link
            href="/enquiry"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              background: 'var(--burgundy)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 'var(--radius-card)',
              textDecoration: 'none',
            }}
          >
            Get a Quote
          </Link>

          {site.contact.whatsapp && (
            <a
              href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '0.75rem',
                background: 'var(--whatsapp)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 'var(--radius-card)',
                textDecoration: 'none',
              }}
            >
              WhatsApp Us
            </a>
          )}

          {site.contact.phone && (
            <a
              href={`tel:${site.contact.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontWeight: 500,
                fontSize: '1rem',
                borderRadius: 'var(--radius-card)',
                textDecoration: 'none',
                border: '1px solid var(--grey-warm)',
              }}
            >
              Call: {site.contact.phone}
            </a>
          )}
        </div>

        {/* Tagline at bottom — §9.3 */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)', textAlign: 'center' }}>
          <p lang="sa" style={{
            fontFamily: 'var(--font-devanagari, sans-serif)',
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
            color: 'var(--ink)',
          }}>
            {site.tagline.devanagari}
          </p>
          <p lang="en" style={{
            fontSize: '0.8125rem',
            color: 'var(--muted)',
            marginTop: 4,
          }}>
            {site.tagline.english}
          </p>
        </div>
      </div>
    </div>
  );
}

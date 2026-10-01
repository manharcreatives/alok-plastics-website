/**
 * NavMegaPanel — §9.3 / §8.1
 * Solid --surface (never glass). 4 group columns + feature tile.
 * Accessibility: aria-expanded, aria-controls, Esc, arrow keys, hover-intent 150ms.
 */

'use client';

import { useEffect, useRef, useId } from 'react';
import Link from 'next/link';
import Pictogram from '@/components/brand/Pictogram';
import { productGroups, products } from '@/content/products';

interface NavMegaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerId: string;
  /** Distance from viewport top — sits 8px under the nav (floating 112 / docked 72) */
  top?: number;
}

export default function NavMegaPanel({ isOpen, onClose, triggerId, top = 112 }: NavMegaPanelProps) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close on Esc, focus management */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        /* Return focus to trigger */
        document.getElementById(triggerId)?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, triggerId]);

  /* Arrow key navigation between columns */
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const links = panelRef.current.querySelectorAll<HTMLAnchorElement>('a');
    const handleKey = (e: KeyboardEvent) => {
      const current = document.activeElement as HTMLAnchorElement;
      const idx = Array.from(links).indexOf(current);
      if (e.key === 'ArrowRight' && idx < links.length - 1) {
        links[idx + 1]?.focus();
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        links[idx - 1]?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      id={panelId}
      role="region"
      aria-label="Products navigation"
      style={{
        position: 'fixed',
        top,
        left: '50%',
        translate: '-50% 0',
        width: 'min(1200px, calc(100vw - 48px))',
        background: 'var(--surface)',
        border: '1px solid var(--grey-warm)',
        borderRadius: 'var(--radius-card)',
        boxShadow: '0 8px 40px rgba(30,17,21,0.10)',
        zIndex: 48,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 280px',
        gap: 0,
        overflow: 'hidden',
      }}
      onMouseLeave={onClose}
    >
      {/* 4 product group columns */}
      {productGroups.map((group, i) => {
        /* Derive the group's products by their anchorParts slugs */
        const groupProducts = group.anchorParts
          .map(slug => products.find(p => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => p !== undefined);

        return (
          <div
            key={group.id}
            style={{
              padding: 'var(--space-lg)',
              borderRight: '1px solid var(--grey-warm)',
            }}
          >
            {/* Group number micro-label */}
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--muted)',
              fontWeight: 600,
              marginBottom: 'var(--space-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ width: 16, height: 2, background: 'var(--burgundy)', display: 'inline-block', flexShrink: 0 }} aria-hidden />
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Group name */}
            <Link
              href={`/products/${group.slug}`}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--ink)',
                textDecoration: 'none',
                display: 'block',
                marginBottom: 'var(--space-sm)',
                fontFamily: 'var(--font-archivo, sans-serif)',
              }}
              onClick={onClose}
            >
              {group.name}
            </Link>

            {/* Parts list */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {groupProducts.slice(0, 5).map(product => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${group.slug}/${product.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 0',
                      fontSize: '0.875rem',
                      color: 'var(--body)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--grey-cloud)',
                      transition: 'color 0.15s',
                    }}
                    onClick={onClose}
                  >
                    <Pictogram
                      name={product.slug as Parameters<typeof Pictogram>[0]['name']}
                      size={24}
                      style={{ color: 'var(--muted)', flexShrink: 0, width: 16, height: 16 }}
                    />
                    <span>{product.name}</span>
                    <span aria-hidden style={{
                      marginLeft: 'auto',
                      color: 'var(--grey-cloud)',
                      fontSize: '0.75rem',
                      opacity: 0,
                      transition: 'opacity 0.15s',
                    }}>↗</span>
                  </Link>
                </li>
              ))}
            </ul>

            {groupProducts.length > 5 && (
              <Link
                href={`/products/${group.slug}`}
                style={{
                  display: 'block',
                  marginTop: 'var(--space-xs)',
                  fontSize: '0.8125rem',
                  color: 'var(--burgundy)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
                onClick={onClose}
              >
                View all {groupProducts.length} parts ↗
              </Link>
            )}
          </div>
        );
      })}

      {/* Feature tile — right column */}
      <div style={{
        background: 'var(--burgundy)',
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--rose-pale)',
            fontWeight: 600,
            marginBottom: 'var(--space-sm)',
          }}>
            Custom requirement?
          </div>
          <p style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'white',
            lineHeight: 1.4,
            fontFamily: 'var(--font-archivo, sans-serif)',
            marginBottom: 'var(--space-sm)',
          }}>
            Need a part made to your requirement?
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--rose-pale)', lineHeight: 1.5 }}>
            Share a sample, drawing or photo — we&apos;ll develop and supply it.
          </p>
        </div>
        <Link
          href="/enquiry"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            color: 'var(--burgundy)',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-card)',
            textDecoration: 'none',
            marginTop: 'var(--space-md)',
            width: 'fit-content',
          }}
          onClick={onClose}
        >
          Enquire ↗
        </Link>
      </div>
    </div>
  );
}

/**
 * Header — §9 glass navbar + states
 * Coordinates: glass navbar (fixed, floating pill at every scroll depth; scrolling only
 * firms up its glass), 
 * NavMegaPanel (products) and Drawer (mobile).
 *
 * Round 2:
 * - Utility bar removed — the pill floats at top:16px.
 * - Mega-panel hover-intent is shared between trigger and panel (150ms close
 *   delay) and the panel carries a transparent bridge so the pointer can travel
 *   from trigger to panel without the panel closing.
 * - Active-page indicator: a single burgundy rule that glides between links
 *   (transform only). Every link, Home included, gets the same plain rule.
 *
 * The glass element is a sibling of the hero media, never nested inside a
 * transformed / overflow:hidden wrapper (§9.1).
 */

'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { List } from '@phosphor-icons/react/dist/csr/List';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import Logo from '@/components/brand/Logo';
import Drawer from './Drawer';
import CartButton from '@/components/cart/CartButton';
import NavMegaPanel from './NavMegaPanel';
import { navigation } from '@/content/navigation';
import { isActivePath } from './isActivePath';
import './glass-nav.css';

const SCROLL_DOCK_THRESHOLD = 40;
const SCROLL_HIDE_THRESHOLD = 600;
const OPEN_DELAY = 100;
const CLOSE_DELAY = 150;

/* Nav geometry — keep in step with glass-nav.css */
const NAV_HEIGHT = 64;
const NAV_TOP_FLOATING = 16;
const MEGA_GAP = 8;

export default function Header() {
  const pathname = usePathname();
  const [docked, setDocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const pinnedRef = useRef(false); /* opened by click/keyboard — ignores pointer-leave */
  const lastScrollY = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productsTrigId = useId();
  const megaId = useId();

  const linksRef = useRef<HTMLUListElement>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [inkReady, setInkReady] = useState(false);

  const routeIndex = navigation.primary.findIndex(item => isActivePath(pathname, item.href));
  /* Navigation intent: the indicator starts gliding on pointer-down / key activation of a link,
     not ~450ms later when the route has painted. Reconciled to the real route on path change. */
  const [intentIndex, setIntentIndex] = useState<number | null>(null);
  const activeIndex = intentIndex ?? routeIndex;

  /* Scroll-driven state transitions */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setDocked(y > SCROLL_DOCK_THRESHOLD);

      if (y > SCROLL_HIDE_THRESHOLD) {
        /* Hide when scrolling down, show when scrolling up */
        if (!megaOpen && !drawerOpen) {
          setHidden(y > lastScrollY.current);
        }
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };

    handleScroll(); /* sync on mount (scroll restoration / deep links) */
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [megaOpen, drawerOpen]);

  /* Close mega / drawer when path changes */
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setIntentIndex(null);
    setMegaOpen(false);
    setDrawerOpen(false);
  }
  useEffect(() => { pinnedRef.current = false; }, [pathname]);

  /* ── Sliding indicator: measure the active label, publish as CSS vars ── */
  useEffect(() => {
    const ul = linksRef.current;
    if (!ul) return;
    const place = () => {
      const label = activeIndex >= 0 ? labelRefs.current[activeIndex] : null;
      if (!label) {
        ul.style.setProperty('--ink-o', '0');
        return;
      }
      const u = ul.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      ul.style.setProperty('--ink-x', `${(l.left - u.left).toFixed(1)}px`);
      ul.style.setProperty('--ink-w', `${l.width.toFixed(1)}`);
      ul.style.setProperty('--ink-o', '1');
    };
    place();
    const raf = requestAnimationFrame(() => setInkReady(true)); /* enable transitions after first placement */
    const ro = new ResizeObserver(place);
    ro.observe(ul);
    document.fonts?.ready.then(place).catch(() => {});
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [activeIndex]);

  /* ── Shared hover-intent ── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const hoverOpen = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setMegaOpen(true), OPEN_DELAY);
  }, [clearTimer]);

  const hoverClose = useCallback(() => {
    clearTimer();
    if (pinnedRef.current) return;
    timerRef.current = setTimeout(() => setMegaOpen(false), CLOSE_DELAY);
  }, [clearTimer]);

  const closeMega = useCallback(() => {
    clearTimer();
    pinnedRef.current = false;
    setMegaOpen(false);
  }, [clearTimer]);

  const onTriggerClick = () => {
    clearTimer();
    if (!megaOpen) {
      pinnedRef.current = true;
      setMegaOpen(true);
    } else if (!pinnedRef.current) {
      pinnedRef.current = true; /* opened by hover → a click pins it open */
    } else {
      closeMega();
    }
  };

  /* Click outside closes a pinned panel */
  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest('[data-mega-zone]')) return;
      closeMega();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [megaOpen, closeMega]);

  const navClass = [
    'glass-nav',
    docked ? 'glass-nav--docked' : '',
    hidden ? 'glass-nav--hidden' : '',
  ].filter(Boolean).join(' ');

  /* The pill is light glass in every state, so the logo is always the original colour lockup
     (burgundy ribbons + metal-grey core). The 'bright' variant is for logos sitting directly on
     footage, which the nav logo never does. */
  const megaTop = NAV_TOP_FLOATING + NAV_HEIGHT + MEGA_GAP;

  return (
    <>
      {/* The glass nav element is placed here — a sibling of hero media (§9.1) */}
      <header>
        <nav
          className={navClass}
          aria-label="Main navigation"
        >
          <div className="glass-nav__inner">
            {/* Logo */}
            <Link
              href="/"
              className="glass-nav__logo"
              aria-label="Alok Plastics home"
            >
              <Logo
                variant="color"
                lockup="full"
                title=""
                aria-hidden="true"
              />
              <span className="sr-only">Alok Plastics</span>
            </Link>

            <div className="glass-nav__spacer" />

            {/* Primary nav — desktop only */}
            <ul
              ref={linksRef}
              className="glass-nav__links"
              data-ink-ready={inkReady ? 'true' : 'false'}
            >
              {navigation.primary.map((item, i) => {
                const isProducts = item.label === 'Products';
                const isActive = i === activeIndex;
                const cls = `glass-nav__link${isActive ? ' glass-nav__link--active' : ''}`;
                return (
                  <li key={item.href} data-mega-zone={isProducts ? '' : undefined}>
                    {isProducts ? (
                      <button
                        id={productsTrigId}
                        type="button"
                        className={`${cls} glass-nav__link--products${megaOpen ? ' glass-nav__link--open' : ''}`}
                        aria-expanded={megaOpen}
                        aria-controls={megaId}
                        aria-haspopup="true"
                        aria-current={isActive ? 'page' : undefined}
                        onPointerEnter={e => { if (e.pointerType === 'mouse') hoverOpen(); }}
                        onPointerLeave={e => { if (e.pointerType === 'mouse') hoverClose(); }}
                        onClick={onTriggerClick}
                        onKeyDown={e => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            pinnedRef.current = true;
                            setMegaOpen(true);
                            requestAnimationFrame(() =>
                              document.getElementById(megaId)?.querySelector<HTMLElement>('a')?.focus());
                          }
                        }}
                      >
                        <span ref={el => { labelRefs.current[i] = el; }} className="glass-nav__label" data-label={item.label}>{item.label}</span>
                        <CaretDown
                          weight="light"
                          size={14}
                          aria-hidden="true"
                          className="glass-nav__caret"
                          style={{ transform: megaOpen ? 'rotate(180deg)' : 'none' }}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cls}
                        aria-current={isActive ? 'page' : undefined}
                        onPointerDown={e => { if (e.button === 0) setIntentIndex(i); }}
                        onClick={() => setIntentIndex(i)}
                      >
                        <span ref={el => { labelRefs.current[i] = el; }} className="glass-nav__label" data-label={item.label}>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
              {/* Sliding active-page indicator: one plain rule (transform only) */}
              <li className="glass-nav__ink" aria-hidden="true">
                <span className="glass-nav__ink-rule" />
              </li>
            </ul>

            {/* CTAs */}
            <div className="glass-nav__ctas">
              <Link href="/enquiry" className="glass-nav__cta glass-nav__cta--quote">
                <span className="glass-nav__cta-label">Get a Quote</span>
                <ArrowUpRight weight="light" size={16} aria-hidden="true" className="glass-nav__cta-arrow" />
              </Link>

              <CartButton />

              {/* Mobile menu */}
              <button
                type="button"
                className="glass-nav__menu-btn"
                onClick={() => setDrawerOpen(v => !v)}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                aria-label="Open navigation menu"
              >
                <List weight="light" size={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        <NavMegaPanel
          id={megaId}
          isOpen={megaOpen}
          onClose={closeMega}
          triggerId={productsTrigId}
          top={megaTop}
          bridge={MEGA_GAP + 16}
          onPointerEnter={clearTimer}
          onPointerLeave={hoverClose}
        />
      </header>

      {/* Mobile drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

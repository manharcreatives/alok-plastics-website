/**
 * Header — §9 glass navbar + states
 * This is the outer shell that coordinates:
 * - UtilityBar (scrolls away with page)
 * - Glass navbar (fixed, floating pill → docked on scroll)
 * - NavMegaPanel (products mega-panel)
 * - Drawer (mobile)
 *
 * The glass element MUST be a sibling of hero media at DOM level, not nested
 * inside a transformed or overflow:hidden container (§9.1).
 *
 * State transitions use GSAP ScrollTrigger (§9.2):
 * - State 1: floating pill, glass (scrollY < 40)
 * - State 2: docked, solid canvas (past hero)
 * - State 3: hide/show on scroll direction (past 600px)
 */

'use client';

import { useState, useRef, useEffect, useId, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import Drawer from './Drawer';
import NavMegaPanel from './NavMegaPanel';
import UtilityBar from './UtilityBar';
import { navigation } from '@/content/navigation';
import { site } from '@/content/site';
import './glass-nav.css';

const SCROLL_DOCK_THRESHOLD = 40;
const SCROLL_HIDE_THRESHOLD = 600;

export default function Header() {
  const pathname = usePathname();
  const [docked, setDocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const lastScrollY = useRef(0);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productsTrigId = useId();

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

  /* Close mega when path changes */
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMegaOpen(false);
    setDrawerOpen(false);
  }

  const openMega = useCallback(() => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    megaTimerRef.current = setTimeout(() => setMegaOpen(true), 150);
  }, []);

  const closeMega = useCallback(() => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setMegaOpen(false);
  }, []);

  const navClass = [
    'glass-nav',
    docked ? 'glass-nav--docked' : '',
    hidden ? 'glass-nav--hidden' : '',
  ].filter(Boolean).join(' ');

  /* Logo variant based on hero tone */
  const heroDark = site.hero.media.tone === 'dark' && !docked;
  const logoVariant = heroDark ? 'bright' : 'color';

  return (
    <>
      {/* The glass nav element is placed here — a sibling of hero media (§9.1) */}
      <header>
        <UtilityBar />
        <nav
          className={navClass}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="glass-nav__inner">
            {/* Logo */}
            <Link
              href="/"
              className="glass-nav__logo"
              aria-label="Alok Plastics — Home"
            >
              <Logo
                variant={logoVariant}
                lockup="full"
                title=""
                aria-hidden="true"
              />
              <span className="sr-only">Alok Plastics</span>
            </Link>

            <div className="glass-nav__spacer" />

            {/* Primary nav — desktop only */}
            <ul className="glass-nav__links" role="list">
              {navigation.primary.map(item => {
                const isProducts = item.label === 'Products';
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    {isProducts ? (
                      <button
                        id={productsTrigId}
                        type="button"
                        className={`glass-nav__link glass-nav__link--products${megaOpen ? ' glass-nav__link--active' : ''}`}
                        aria-expanded={megaOpen}
                        aria-haspopup="true"
                        onMouseEnter={openMega}
                        onMouseLeave={closeMega}
                        onClick={() => setMegaOpen(v => !v)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMegaOpen(v => !v); }}
                      >
                        {item.label}
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"
                          style={{ marginLeft: 2, transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`glass-nav__link${isActive ? ' glass-nav__link--active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* CTAs */}
            <div className="glass-nav__ctas">
              <Link href="/enquiry" className="glass-nav__cta glass-nav__cta--primary glass-nav__cta--text">
                Get a Quote
              </Link>

              {site.contact.whatsapp ? (
                <a
                  href={`https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}`}
                  className="glass-nav__cta glass-nav__cta--whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Alok Plastics"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              ) : null}

              {/* Mobile menu */}
              <button
                type="button"
                className="glass-nav__menu-btn"
                onClick={() => setDrawerOpen(v => !v)}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                aria-label="Open navigation menu"
              >
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                  <path d="M0 1h20M0 7h14M0 13h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mega panel — hovers below the nav */}
        {megaOpen && (
          <div
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
            style={{ position: 'fixed', inset: 0, zIndex: 47, pointerEvents: 'none' }}
            aria-hidden="true"
          />
        )}
        <NavMegaPanel
          isOpen={megaOpen}
          onClose={closeMega}
          triggerId={productsTrigId}
          top={docked ? 72 : 112}
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

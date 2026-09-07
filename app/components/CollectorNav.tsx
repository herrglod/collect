'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/collector', label: 'My Artworks' },
  { href: '/collector/news', label: 'News' },
  { href: '/collector/exclusive', label: 'Exclusive Art' },
  { href: '/collector/events', label: 'Events' },
  { href: '/collector/marketplace', label: 'Marketplace' },
];

export default function CollectorNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function isActive(href: string) {
    return href === '/collector' ? pathname === '/collector' : pathname.startsWith(href);
  }

  return (
    <>
      <nav className="primary-nav primary-nav-desktop">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={isActive(link.href) ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mobile-nav" ref={rootRef}>
        <button
          type="button"
          className="mobile-nav-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          Menu
        </button>
        {open && (
          <div className="mobile-nav-dropdown">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

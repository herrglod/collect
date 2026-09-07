'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/partner', label: 'Inventory' },
  { href: '/partner/available', label: 'Available' },
  { href: '/partner/artist-media', label: 'Artist Media' },
  { href: '/partner/news', label: 'News' },
];

export default function PartnerNav() {
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
    return href === '/partner' ? pathname === '/partner' : pathname.startsWith(href);
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
        <button type="button" className="mobile-nav-trigger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          Menu {open ? '▴' : '▾'}
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

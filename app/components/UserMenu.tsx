'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DEFAULT_LINKS = [
  { href: '/collector/account', label: 'Account' },
  { href: '/collector/connect-art', label: 'Connect Art' },
  { href: '/collector/requests', label: 'My Requests' },
  { href: '/collector/settings', label: 'Settings' },
  { href: '/collector/certificates', label: 'Certificates' },
];

export default function UserMenu({
  name,
  links = DEFAULT_LINKS,
}: {
  name: string;
  links?: { href: string; label: string }[];
}) {
  const router = useRouter();
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

  async function handleLogout() {
    setOpen(false);
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="user-menu" ref={rootRef}>
      <button className="user-menu-trigger" onClick={() => setOpen((v) => !v)} type="button">
        <span className="user-menu-name">{name}</span>
        <span className="user-avatar">{getInitials(name)}</span>
      </button>
      {open && (
        <div className="user-menu-dropdown">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="user-menu-item" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <button className="user-menu-item" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

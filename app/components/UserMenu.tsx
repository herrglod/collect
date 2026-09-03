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

export default function UserMenu({ name }: { name: string }) {
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
          <Link href="/collector/account" className="user-menu-item" onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link href="/collector/connect-art" className="user-menu-item" onClick={() => setOpen(false)}>
            Connect Art
          </Link>
          <Link href="/collector/requests" className="user-menu-item" onClick={() => setOpen(false)}>
            My Requests
          </Link>
          <Link href="/collector/settings" className="user-menu-item" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <button className="user-menu-item" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

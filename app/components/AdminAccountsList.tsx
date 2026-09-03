'use client';

import { useMemo, useState } from 'react';
import AdminAccountRow from './AdminAccountRow';

type Contact = {
  contact_id: number;
  name: string;
  type: string;
  contact_email: string | null;
  contact_phone: string | null;
  platform_user_id: number | null;
  login_email: string | null;
  role: string | null;
};

export default function AdminAccountsList({ contacts }: { contacts: Contact[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.contact_email || '').toLowerCase().includes(q) ||
        (c.login_email || '').toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div>
      <div className="field" style={{ maxWidth: 360, marginBottom: 20 }}>
        <label htmlFor="account-search">Search</label>
        <input
          id="account-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No matches.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c) => (
            <AdminAccountRow key={c.contact_id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}

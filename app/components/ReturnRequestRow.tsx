'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ReturnRow = {
  ownership_id: number;
  archive_number: string;
  artwork_name: string;
  contact_name: string;
  contact_email: string | null;
  updated_at: string;
};

export default function ReturnRequestRow({ row }: { row: ReturnRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function resolve() {
    if (!confirm('Mark this return as handled?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resolve-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownership_id: row.ownership_id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error updating.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr>
      <td>
        {row.contact_name}
        {row.contact_email && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{row.contact_email}</div>}
      </td>
      <td>
        {row.archive_number} — {row.artwork_name}
      </td>
      <td>{new Date(row.updated_at).toLocaleDateString('en-GB')}</td>
      <td>
        <button
          onClick={resolve}
          disabled={loading}
          style={{ background: 'var(--ink)', color: 'var(--bg)', border: 'none', padding: '4px 10px', fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {loading ? '…' : 'Mark Handled'}
        </button>
      </td>
    </tr>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ActiveOwnership = {
  ownership_id: number;
  contact_id: number;
  contact_name: string;
  contact_email: string | null;
  archive_number: string;
  artwork_name: string;
  edition_number: string | null;
  acquired_at: string;
};

export default function OwnershipRow({ ownership }: { ownership: ActiveOwnership }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [archiveNumber, setArchiveNumber] = useState(ownership.archive_number);
  const [editionNumber, setEditionNumber] = useState(ownership.edition_number ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancelEdit() {
    setEditing(false);
    setArchiveNumber(ownership.archive_number);
    setEditionNumber(ownership.edition_number ?? '');
    setError(null);
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/update-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownership_id: ownership.ownership_id,
          archive_number: archiveNumber.trim().toUpperCase(),
          edition_number: editionNumber.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error saving.');
        setLoading(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    if (!confirm('End this assignment?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/end-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownership_id: ownership.ownership_id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error ending assignment.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr>
      <td>
        {ownership.contact_name}
        {ownership.contact_email && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{ownership.contact_email}</div>
        )}
      </td>
      <td>
        {editing ? (
          <input
            value={archiveNumber}
            onChange={(e) => setArchiveNumber(e.target.value)}
            style={{ width: 110, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
          />
        ) : (
          ownership.archive_number
        )}
      </td>
      <td>{ownership.artwork_name}</td>
      <td>
        {editing ? (
          <input
            value={editionNumber}
            onChange={(e) => setEditionNumber(e.target.value)}
            placeholder="e.g. 3/20"
            style={{ width: 90, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
          />
        ) : (
          ownership.edition_number ?? '—'
        )}
      </td>
      <td>{new Date(ownership.acquired_at).toLocaleDateString('en-GB')}</td>
      <td>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {loading ? '…' : 'Save'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Edit
            </button>
            <button
              onClick={handleEnd}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              End
            </button>
          </div>
        )}
        {error && <div style={{ color: '#b0281a', fontSize: 11, marginTop: 6 }}>{error}</div>}
      </td>
    </tr>
  );
}

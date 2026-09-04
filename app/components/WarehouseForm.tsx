'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WarehouseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), location: location.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error creating warehouse.');
        setLoading(false);
        return;
      }
      setName('');
      setLocation('');
      setOpen(false);
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button className="btn" type="button" onClick={() => setOpen(true)} style={{ marginBottom: 24 }}>
        + New Warehouse
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        border: '1px solid var(--line)',
        padding: 16,
        marginBottom: 24,
      }}
    >
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="warehouse-name">Warehouse Name</label>
        <input
          id="warehouse-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vienna Studio"
          style={{ width: 220 }}
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="warehouse-location">Location (optional)</label>
        <input
          id="warehouse-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Vienna, Austria"
          style={{ width: 220 }}
        />
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Saving…' : 'Create'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{
          background: 'transparent',
          border: '1px solid var(--line)',
          padding: '13px 20px',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
      {error && <div className="error-msg" style={{ width: '100%', marginBottom: 0 }}>{error}</div>}
    </form>
  );
}

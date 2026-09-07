'use client';

import { useState } from 'react';

export default function EditionNumberRequestForm({
  archiveNumber,
}: {
  archiveNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/collector/request-edition-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_number: archiveNumber, edition_number: value.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error submitting.');
        return;
      }
      setDone(true);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <div className="badge" style={{ marginTop: 8 }}>Edition number submitted — pending review</div>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          border: '1px solid var(--line)',
          padding: '4px 10px',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        Enter your limited number
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 3/20"
        style={{ width: 90, padding: '4px 6px', border: '1px solid var(--line)', fontSize: 12 }}
        autoFocus
      />
      <button
        type="button"
        onClick={handleSubmit}
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
        {loading ? '…' : 'Submit'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
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
      {error && <span style={{ color: '#b0281a', fontSize: 11 }}>{error}</span>}
    </div>
  );
}

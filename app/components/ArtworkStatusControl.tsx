'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtworkStatusControl({
  ownershipId,
  status,
}: {
  ownershipId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(next: 'sold' | 'retour_requested') {
    const confirmMsg =
      next === 'sold'
        ? 'Mark this artwork as sold? It will move to your Sold list.'
        : 'Request a return for this artwork? The GLOD team will reach out to arrange it.';
    if (!confirm(confirmMsg)) return;
    setLoading(next);
    try {
      const res = await fetch('/api/collector/update-ownership-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownership_id: ownershipId, status: next }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error updating status.');
      }
    } finally {
      setLoading(null);
    }
  }

  if (status === 'retour_requested') {
    return <div className="badge">Return requested</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button
        type="button"
        onClick={() => updateStatus('sold')}
        disabled={loading !== null}
        style={{
          background: 'transparent',
          border: '1px solid var(--line)',
          padding: '4px 10px',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        {loading === 'sold' ? '…' : 'Mark as Sold'}
      </button>
      <button
        type="button"
        onClick={() => updateStatus('retour_requested')}
        disabled={loading !== null}
        style={{
          background: 'transparent',
          border: '1px solid var(--line)',
          padding: '4px 10px',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        {loading === 'retour_requested' ? '…' : 'Request Return'}
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function ArtworkSaveButton({
  archiveNumber,
  initialSaved,
}: {
  archiveNumber: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !saved;
    setSaved(next);
    setLoading(true);
    try {
      const res = await fetch('/api/collector/save-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_number: archiveNumber }),
      });
      if (!res.ok) {
        setSaved(!next);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (typeof data.saved === 'boolean') setSaved(data.saved);
    } catch {
      setSaved(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={loading} className={`save-btn${saved ? ' active' : ''}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}

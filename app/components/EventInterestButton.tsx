'use client';

import { useState } from 'react';

export default function EventInterestButton({
  eventId,
  initialInterested,
}: {
  eventId: number;
  initialInterested: boolean;
}) {
  const [interested, setInterested] = useState(initialInterested);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !interested;
    setInterested(next);
    setLoading(true);
    try {
      const res = await fetch('/api/collector/event-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      if (!res.ok) {
        setInterested(!next);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (typeof data.interested === 'boolean') setInterested(data.interested);
    } catch {
      setInterested(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`event-interest-btn${interested ? ' active' : ''}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={interested ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {interested ? 'Interested' : 'I’m Interested'}
    </button>
  );
}

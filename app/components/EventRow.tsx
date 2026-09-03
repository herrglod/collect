'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  date_precision: 'exact' | 'month';
  location: string | null;
  image_url: string | null;
  interest_count: number;
};

function toDateInputValue(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMonthInputValue(value: string | Date): string {
  return toDateInputValue(value).slice(0, 7);
}

function formatEventDate(value: string | Date, precision: 'exact' | 'month'): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  if (precision === 'month') {
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function EventRow({ event }: { event: Event }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [imageUrl, setImageUrl] = useState(event.image_url || '');
  const [datePrecision, setDatePrecision] = useState<'exact' | 'month'>(event.date_precision);
  const [eventDate, setEventDate] = useState(toDateInputValue(event.event_date));
  const [eventMonth, setEventMonth] = useState(toMonthInputValue(event.event_date));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          image_url: imageUrl.trim() || null,
          date_precision: datePrecision,
          event_date: datePrecision === 'month' ? eventMonth : eventDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong.');
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <div style={{ border: '1px solid var(--line)', padding: '16px 20px' }}>
        {error && (
          <div className="error-msg" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field">
          <label>Image URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <div className="field">
          <label>Date</label>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                checked={datePrecision === 'exact'}
                onChange={() => setDatePrecision('exact')}
              />
              Exact date
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
              <input
                type="radio"
                checked={datePrecision === 'month'}
                onChange={() => setDatePrecision('month')}
              />
              Month &amp; year only
            </label>
          </div>
          {datePrecision === 'exact' ? (
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          ) : (
            <input type="month" value={eventMonth} onChange={(e) => setEventMonth(e.target.value)} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={loading} className="btn">
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--line)',
              padding: '13px 24px',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid var(--line)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>
          {formatEventDate(event.event_date, event.date_precision)}
          {event.location ? ` · ${event.location}` : ''}
          {' · '}
          <strong style={{ color: 'var(--ink)' }}>
            {event.interest_count} interested
          </strong>
        </div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{event.title}</div>
        {event.description && <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{event.description}</div>}
        {event.image_url && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{event.image_url}</div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, height: 'fit-content', flexShrink: 0 }}>
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
          onClick={handleDelete}
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
          Delete
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
};

function toDateInputValue(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EventRow({ event }: { event: Event }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [imageUrl, setImageUrl] = useState(event.image_url || '');
  const [eventDate, setEventDate] = useState(toDateInputValue(event.event_date));
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
          event_date: eventDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler beim Speichern.');
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Dieses Event wirklich löschen?')) return;
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
        alert(data.error || 'Fehler beim Löschen.');
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
          <label>Titel</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Beschreibung</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Ort</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="field">
          <label>Bild-URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <div className="field">
          <label>Datum</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={loading} className="btn">
            {loading ? 'Speichert…' : 'Speichern'}
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
            Abbrechen
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
          {new Date(event.event_date).toLocaleDateString('de-DE')}
          {event.location ? ` · ${event.location}` : ''}
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
          Bearbeiten
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
          Löschen
        </button>
      </div>
    </div>
  );
}

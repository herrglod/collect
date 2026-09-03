'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EventComposer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [eventDate, setEventDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Bitte einen Titel eingeben.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          image_url: imageUrl.trim() || null,
          event_date: eventDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen.');
        setLoading(false);
        return;
      }
      setTitle('');
      setDescription('');
      setLocation('');
      setImageUrl('');
      setEventDate(todayISO());
      router.refresh();
    } catch {
      setError('Unerwarteter Fehler.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 560 }}>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Titel</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="description">Beschreibung (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Was erwartet die Sammler bei diesem Event?"
          />
        </div>
        <div className="field">
          <label htmlFor="location">Ort (optional)</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z. B. Vienna"
          />
        </div>
        <div className="field">
          <label htmlFor="image_url">Bild-URL (optional)</label>
          <input
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="field">
          <label htmlFor="event_date">Datum</label>
          <input
            id="event_date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Wird erstellt…' : 'Event veröffentlichen'}
        </button>
      </form>
    </div>
  );
}

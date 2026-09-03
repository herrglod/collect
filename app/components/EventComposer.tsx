'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

export default function EventComposer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [datePrecision, setDatePrecision] = useState<'exact' | 'month'>('exact');
  const [eventDate, setEventDate] = useState(todayISO());
  const [eventMonth, setEventMonth] = useState(currentMonthValue());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Please enter a title.');
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
          date_precision: datePrecision,
          event_date: datePrecision === 'month' ? eventMonth : eventDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }
      setTitle('');
      setDescription('');
      setLocation('');
      setImageUrl('');
      setDatePrecision('exact');
      setEventDate(todayISO());
      setEventMonth(currentMonthValue());
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 560 }}>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should collectors expect at this event?"
          />
        </div>
        <div className="field">
          <label htmlFor="location">Location (optional)</label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Vienna"
          />
        </div>
        <div className="field">
          <label htmlFor="image_url">Image URL (optional)</label>
          <input
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
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
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Publishing…' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
}

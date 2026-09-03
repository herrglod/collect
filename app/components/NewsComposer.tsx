'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewsComposer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postedAt, setPostedAt] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Bitte einen Text eingeben.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || null,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          posted_at: postedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Fehler beim Veröffentlichen.');
        setLoading(false);
        return;
      }
      setTitle('');
      setContent('');
      setImageUrl('');
      setPostedAt(todayISO());
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
          <label htmlFor="title">Überschrift (optional)</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="content">Beitrag</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was gibt es Neues?"
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
          <label htmlFor="posted_at">Beitragsdatum</label>
          <input
            id="posted_at"
            type="date"
            value={postedAt}
            onChange={(e) => setPostedAt(e.target.value)}
          />
          <div className="field-hint">Für rückwirkend verfasste News kannst du das Datum anpassen.</div>
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Wird veröffentlicht…' : 'Veröffentlichen'}
        </button>
      </form>
    </div>
  );
}

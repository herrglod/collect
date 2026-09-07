'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const CATEGORIES = ['Press', 'Artist', 'Project', 'Exhibition', 'Streetart', 'Collaboration'];

export default function NewsComposer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [postedAt, setPostedAt] = useState(todayISO());
  const [category, setCategory] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [visibleCollectors, setVisibleCollectors] = useState(true);
  const [visiblePartners, setVisiblePartners] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Please enter some text.');
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
          category: category || null,
          source_url: sourceUrl.trim() || null,
          visible_collectors: visibleCollectors,
          visible_partners: visiblePartners,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error publishing.');
        setLoading(false);
        return;
      }
      setTitle('');
      setContent('');
      setImageUrl('');
      setPostedAt(todayISO());
      setCategory('');
      setSourceUrl('');
      setVisibleCollectors(true);
      setVisiblePartners(false);
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
          <label htmlFor="title">Title (optional)</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="content">Post</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's new?"
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
          <label htmlFor="posted_at">Post Date</label>
          <input
            id="posted_at"
            type="date"
            value={postedAt}
            onChange={(e) => setPostedAt(e.target.value)}
          />
          <div className="field-hint">For backdated news, you can adjust the date.</div>
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">— None —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="source_url">Source / Reference Link (optional)</label>
          <input
            id="source_url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://… (opens in a new tab)"
          />
        </div>
        <div className="field">
          <label>Visible to</label>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={visibleCollectors}
                onChange={(e) => setVisibleCollectors(e.target.checked)}
              />
              Collectors
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={visiblePartners}
                onChange={(e) => setVisiblePartners(e.target.checked)}
              />
              Gallery Partners
            </label>
          </div>
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  );
}

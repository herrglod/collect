'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NewsPost = {
  id: number;
  title: string | null;
  content: string;
  image_url: string | null;
  posted_at: string;
};

function toDateInputValue(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function NewsPostRow({ post }: { post: NewsPost }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title || '');
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.image_url || '');
  const [postedAt, setPostedAt] = useState(toDateInputValue(post.posted_at));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          title: title.trim() || null,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          posted_at: postedAt,
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
    if (!confirm('Diesen Beitrag wirklich löschen?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delete-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id }),
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
        {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="field">
          <label>Überschrift</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Beitrag</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="field">
          <label>Bild-URL</label>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <div className="field">
          <label>Beitragsdatum</label>
          <input type="date" value={postedAt} onChange={(e) => setPostedAt(e.target.value)} />
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
          {new Date(post.posted_at).toLocaleDateString('de-DE')}
        </div>
        {post.title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{post.title}</div>}
        <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{post.content}</div>
        {post.image_url && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{post.image_url}</div>
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NewsPost = {
  id: number;
  content: string;
  image_url: string | null;
  created_at: string;
};

export default function NewsPostRow({ post }: { post: NewsPost }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ border: '1px solid var(--line)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>
          {new Date(post.created_at).toLocaleString('de-DE')}
        </div>
        <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{post.content}</div>
        {post.image_url && (
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{post.image_url}</div>
        )}
      </div>
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
          height: 'fit-content',
          flexShrink: 0,
        }}
      >
        Löschen
      </button>
    </div>
  );
}

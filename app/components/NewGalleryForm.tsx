'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGalleryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name ist erforderlich.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, city: city.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Fehler beim Anlegen.');
        setLoading(false);
        return;
      }
      setName('');
      setEmail('');
      setCity('');
      setOpen(false);
      router.refresh();
    } catch {
      setError('Unerwarteter Fehler.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button className="btn" type="button" onClick={() => setOpen(true)} style={{ marginRight: 12 }}>
        + Neue Gallery
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        border: '1px solid var(--line)',
        padding: 16,
        marginBottom: 24,
      }}
    >
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="gallery-name">Gallery Name</label>
        <input id="gallery-name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: 200 }} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="gallery-email">E-Mail (optional)</label>
        <input id="gallery-email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: 200 }} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="gallery-city">Stadt (optional)</label>
        <input id="gallery-city" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: 160 }} />
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Speichert…' : 'Anlegen'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{
          background: 'transparent',
          border: '1px solid var(--line)',
          padding: '13px 20px',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: 'pointer',
        }}
      >
        Abbrechen
      </button>
      {error && <div className="error-msg" style={{ width: '100%', marginBottom: 0 }}>{error}</div>}
    </form>
  );
}

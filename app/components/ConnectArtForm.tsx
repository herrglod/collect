'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ARTWORK_TYPES = [
  { value: 'unique', label: 'Unique Artwork' },
  { value: 'limited_edition', label: 'Limited Edition' },
  { value: 'object', label: 'Object / Sculpture' },
  { value: 'fashion', label: 'Fashion' },
];

export default function ConnectArtForm({ defaultDescription = '' }: { defaultDescription?: string }) {
  const router = useRouter();
  const [description, setDescription] = useState(defaultDescription);
  const [artworkType, setArtworkType] = useState('');
  const [purchasedFrom, setPurchasedFrom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!description.trim()) {
      setError('Please describe the artwork you would like to connect.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/collector/connect-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          artwork_type: artworkType || null,
          purchased_from: purchasedFrom.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not submit your request.');
        setLoading(false);
        return;
      }
      setSuccess('Thank you — your request has been submitted for review.');
      setDescription('');
      setArtworkType('');
      setPurchasedFrom('');
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card" style={{ maxWidth: 520 }}>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="artwork_type">Type of Artwork</label>
          <select id="artwork_type" value={artworkType} onChange={(e) => setArtworkType(e.target.value)}>
            <option value="">— Select —</option>
            {ARTWORK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="purchased_from">Where was it purchased?</label>
          <input
            id="purchased_from"
            value={purchasedFrom}
            onChange={(e) => setPurchasedFrom(e.target.value)}
            placeholder="e.g. GLOD Shop, gallery name, an event…"
          />
        </div>
        <div className="field">
          <label htmlFor="description">Describe the artwork</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. title, edition number, where and when you acquired it, proof of purchase reference…"
          />
          <div className="field-hint">
            Our team will verify your acquisition before linking the piece to your collection.
          </div>
        </div>
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

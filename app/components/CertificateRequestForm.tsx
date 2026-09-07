'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Artwork = {
  archive_number: string;
  name: string;
  edition_type: 'unique' | 'limited_edition';
  already_requested: boolean;
};

export default function CertificateRequestForm({ artworks }: { artworks: Artwork[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggle(archiveNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(archiveNumber)) next.delete(archiveNumber);
      else next.add(archiveNumber);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/collector/request-certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_numbers: Array.from(selected) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not submit your request.');
        return;
      }
      setSuccess('Thank you — the GLOD team will be in touch to arrange your certification and payment.');
      setSelected(new Set());
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  if (artworks.length === 0) {
    return <div className="empty-state">You don't currently have any artworks eligible for certification.</div>;
  }

  return (
    <div>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th>Archive No.</th>
            <th>Artwork</th>
            <th>Type</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {artworks.map((a) => (
            <tr key={a.archive_number}>
              <td>
                {a.already_requested ? (
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase' }}>
                    Requested
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selected.has(a.archive_number)}
                    onChange={() => toggle(a.archive_number)}
                  />
                )}
              </td>
              <td>{a.archive_number}</td>
              <td>{a.name}</td>
              <td>{a.edition_type === 'unique' ? 'Unique' : 'Limited Edition'}</td>
              <td>{a.edition_type === 'unique' ? '$50' : '$25'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn"
        type="button"
        disabled={selected.size === 0 || loading}
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
      >
        {loading ? 'Submitting…' : `Apply for New Certification (${selected.size})`}
      </button>
    </div>
  );
}

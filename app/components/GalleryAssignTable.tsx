'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type AvailableArtwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  price_public: number | null;
};

type GalleryContact = { id: number; name: string };

export default function GalleryAssignTable({
  artworks,
  galleries,
}: {
  artworks: AvailableArtwork[];
  galleries: GalleryContact[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [galleryId, setGalleryId] = useState('');
  const [deliveredAt, setDeliveredAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter(
      (a) => a.archive_number.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [artworks, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selected.has(a.archive_number));

  function toggleOne(archiveNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(archiveNumber)) next.delete(archiveNumber);
      else next.add(archiveNumber);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filtered.forEach((a) => next.delete(a.archive_number));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((a) => next.add(a.archive_number));
      return next;
    });
  }

  async function handleAssign() {
    if (selected.size === 0 || !galleryId) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assign-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: Number(galleryId),
          archive_numbers: Array.from(selected),
          delivered_at: deliveredAt || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error assigning.');
        return;
      }
      if (data.errors?.length) {
        setError(data.errors.join(' '));
      }
      if (data.assignedCount > 0) {
        setSuccessMsg(`${data.assignedCount} artwork(s) assigned.`);
      }
      setSelected(new Set());
      router.refresh();
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: 360, marginBottom: 24 }}>
        <label htmlFor="gallery-assign-search">Search</label>
        <input
          id="gallery-assign-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or archive no…"
        />
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>{selected.size} selected</span>
          <select value={galleryId} onChange={(e) => setGalleryId(e.target.value)}>
            <option value="">— Select gallery partner —</option>
            {galleries.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            Delivered on
            <input
              type="date"
              value={deliveredAt}
              onChange={(e) => setDeliveredAt(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
            />
          </label>
          <button className="btn" type="button" onClick={handleAssign} disabled={loading || !galleryId}>
            {loading ? 'Assigning…' : 'Assign to Gallery Partner'}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={{ background: 'transparent', border: '1px solid var(--line)', padding: '13px 16px', fontSize: 12, cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}
      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
      {successMsg && <div style={{ color: '#2f6b2f', fontSize: 13, marginBottom: 16 }}>{successMsg}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          {artworks.length === 0 ? 'Every artwork in the archive is currently assigned.' : 'No matches.'}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" className="table-checkbox" checked={allFilteredSelected} onChange={toggleAll} />
              </th>
              <th></th>
              <th>Archive No.</th>
              <th>Artwork</th>
              <th>Edition Type</th>
              <th>Price (EUR)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.archive_number}>
                <td>
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selected.has(a.archive_number)}
                    onChange={() => toggleOne(a.archive_number)}
                  />
                </td>
                <td>
                  {a.featured_image_url ? (
                    <img src={a.featured_image_url} alt={a.name} style={{ width: 40, height: 40, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, background: '#f0f0f0' }} />
                  )}
                </td>
                <td>{a.archive_number}</td>
                <td>{a.name}</td>
                <td>{a.edition_type === 'unique' ? 'Unique' : 'Limited Edition'}</td>
                <td>{a.price_public != null ? a.price_public.toLocaleString('en-GB') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

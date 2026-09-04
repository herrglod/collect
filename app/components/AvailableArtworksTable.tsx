'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type AvailableArtwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
};

const CATEGORY_LABEL: Record<AvailableArtwork['category'], string> = {
  artwork: 'Artwork',
  objects: 'Objects',
  fashion: 'Fashion',
};

export default function AvailableArtworksTable({ artworks }: { artworks: AvailableArtwork[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter(
      (a) => a.archive_number.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [artworks, search]);

  return (
    <div>
      <div className="field" style={{ maxWidth: 360, marginBottom: 24 }}>
        <label htmlFor="available-search">Search</label>
        <input
          id="available-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or archive no…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {artworks.length === 0 ? 'Every artwork in the archive is currently assigned.' : 'No matches.'}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Archive No.</th>
              <th>Artwork</th>
              <th>Category</th>
              <th>Edition Type</th>
              <th>For Sale</th>
              <th>Price (EUR)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.archive_number}>
                <td>
                  {a.featured_image_url ? (
                    <img
                      src={a.featured_image_url}
                      alt={a.name}
                      style={{ width: 40, height: 40, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, background: '#f0f0f0' }} />
                  )}
                </td>
                <td>{a.archive_number}</td>
                <td>{a.name}</td>
                <td>{CATEGORY_LABEL[a.category]}</td>
                <td>{a.edition_type === 'unique' ? 'Unique' : 'Limited Edition'}</td>
                <td>{a.for_sale ? 'Yes' : '—'}</td>
                <td>{a.price_public != null ? a.price_public.toLocaleString('en-GB') : '—'}</td>
                <td>
                  <Link
                    href={`/admin/assign?archive_number=${encodeURIComponent(a.archive_number)}`}
                    style={{
                      display: 'inline-block',
                      border: '1px solid var(--line)',
                      padding: '4px 10px',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Assign
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

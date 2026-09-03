'use client';

import { useMemo, useState } from 'react';
import ArtworkRow from './ArtworkRow';

type Artwork = {
  archive_number: string;
  name: string;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
};

export default function ArtworksTable({ artworks }: { artworks: Artwork[] }) {
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
        <label htmlFor="artwork-search">Search</label>
        <input
          id="artwork-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or archive no…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No matches.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
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
              <ArtworkRow key={a.archive_number} artwork={a} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

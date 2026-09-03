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
        <label htmlFor="artwork-search">Suche</label>
        <input
          id="artwork-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name oder Archive Nr…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Keine Treffer.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Archive Nr.</th>
              <th>Werk</th>
              <th>Kategorie</th>
              <th>Edition-Typ</th>
              <th>Zum Verkauf</th>
              <th>Preis (EUR)</th>
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

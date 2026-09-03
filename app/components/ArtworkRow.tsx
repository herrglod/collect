'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Artwork = {
  archive_number: string;
  name: string;
  category: 'artwork' | 'objects' | 'fashion';
  for_sale: boolean;
  price_public: number | null;
};

export default function ArtworkRow({ artwork }: { artwork: Artwork }) {
  const router = useRouter();
  const [category, setCategory] = useState(artwork.category);
  const [forSale, setForSale] = useState(artwork.for_sale);
  const [price, setPrice] = useState(artwork.price_public != null ? String(artwork.price_public) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: { category?: string; for_sale?: boolean; price_public?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_number: artwork.archive_number,
          category: next.category ?? category,
          for_sale: next.for_sale ?? forSale,
          price_public: next.price_public !== undefined ? next.price_public : price,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fehler beim Speichern.');
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr>
      <td>{artwork.archive_number}</td>
      <td>{artwork.name}</td>
      <td>
        <select
          value={category}
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value as Artwork['category'];
            setCategory(val);
            save({ category: val });
          }}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
        >
          <option value="artwork">Artwork</option>
          <option value="objects">Objects</option>
          <option value="fashion">Fashion</option>
        </select>
      </td>
      <td>
        <label className="switch">
          <input
            type="checkbox"
            checked={forSale}
            disabled={loading}
            onChange={(e) => {
              setForSale(e.target.checked);
              save({ for_sale: e.target.checked });
            }}
          />
          <span className="switch-track" />
        </label>
      </td>
      <td>
        <input
          value={price}
          disabled={loading}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => save({ price_public: price })}
          placeholder="z. B. 4500"
          style={{ width: 100, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
        />
      </td>
      <td>{error && <span style={{ color: '#b0281a', fontSize: 11 }}>{error}</span>}</td>
    </tr>
  );
}

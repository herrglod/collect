'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Artwork = {
  archive_number: string;
  name: string;
  year: number | null;
  medium: string | null;
  size: string | null;
  rarity: string | null;
  featured_image_url: string | null;
  price_partner: number | null;
  category: string;
  edition_type: 'unique' | 'limited_edition';
  slug: string | null;
};

export default function PartnerAvailableTable({ artworks }: { artworks: Artwork[] }) {
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'none'>('none');
  const [typeFilter, setTypeFilter] = useState<'all' | 'unique' | 'limited_edition'>('all');

  const filtered = useMemo(() => {
    let list = artworks;
    if (typeFilter !== 'all') {
      list = list.filter((a) => a.edition_type === typeFilter);
    }
    if (sort === 'price_asc') {
      list = [...list].sort((a, b) => (a.price_partner ?? Infinity) - (b.price_partner ?? Infinity));
    } else if (sort === 'price_desc') {
      list = [...list].sort((a, b) => (b.price_partner ?? -Infinity) - (a.price_partner ?? -Infinity));
    }
    return list;
  }, [artworks, sort, typeFilter]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Sort by Price</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="none">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="unique">Unique Artwork</option>
            <option value="limited_edition">Limited Edition</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No artworks match your filters.</div>
      ) : (
        <div className="grid">
          {filtered.map((art) => (
            <div className="card" key={art.archive_number}>
              {art.featured_image_url ? (
                <img className="card-image" src={art.featured_image_url} alt={art.name} />
              ) : (
                <div className="card-image" />
              )}
              <div className="card-body">
                <div className="card-number">{art.archive_number}</div>
                <h3 className="card-title">{art.name}</h3>
                <div className="card-meta">{[art.year, art.medium, art.size].filter(Boolean).join(' · ')}</div>
                {art.rarity && <div className="badge">{art.rarity}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, gap: 12 }}>
                  {art.price_partner != null ? (
                    <div className="exclusive-price" style={{ marginTop: 0 }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(art.price_partner)}
                    </div>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/partner/inquire?archive_number=${encodeURIComponent(art.archive_number)}&name=${encodeURIComponent(art.name)}`}
                    className="btn"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                  >
                    Inquire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

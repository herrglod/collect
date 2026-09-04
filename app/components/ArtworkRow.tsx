'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Artwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
  for_sale_audience: 'collectors' | 'gallery' | 'both';
  price_partner: number | null;
  saved_count: number;
  warehouse_id: number | null;
  is_owned: boolean;
};

type Warehouse = { id: number; name: string };

export default function ArtworkRow({
  artwork,
  warehouses,
  audience,
  selected,
  onToggleSelect,
}: {
  artwork: Artwork;
  warehouses: Warehouse[];
  audience: 'collectors' | 'gallery';
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(artwork.category);
  const [editionType, setEditionType] = useState(artwork.edition_type);
  const [forSale, setForSale] = useState(artwork.for_sale);
  const [price, setPrice] = useState(artwork.price_public != null ? String(artwork.price_public) : '');
  const [galleryVisible, setGalleryVisible] = useState(
    artwork.for_sale_audience === 'gallery' || artwork.for_sale_audience === 'both'
  );
  const [pricePartner, setPricePartner] = useState(
    artwork.price_partner != null ? String(artwork.price_partner) : ''
  );
  const [warehouseId, setWarehouseId] = useState(artwork.warehouse_id != null ? String(artwork.warehouse_id) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 1800);
    return () => clearTimeout(t);
  }, [savedFlash]);

  async function save(next: {
    category?: string;
    edition_type?: string;
    for_sale?: boolean;
    price_public?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_number: artwork.archive_number,
          category: next.category ?? category,
          edition_type: next.edition_type ?? editionType,
          for_sale: next.for_sale ?? forSale,
          price_public: next.price_public !== undefined ? next.price_public : price,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error saving.');
        return;
      }
      setSavedFlash(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveAudience(next: { gallery_visible?: boolean; price_partner?: string }) {
    setLoading(true);
    setError(null);
    try {
      const nextGalleryVisible = next.gallery_visible ?? galleryVisible;
      const nextAudience = nextGalleryVisible ? 'both' : 'collectors';
      const res = await fetch('/api/admin/update-artwork-audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_number: artwork.archive_number,
          for_sale_audience: nextAudience,
          price_partner: next.price_partner !== undefined ? next.price_partner : pricePartner,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error saving.');
        return;
      }
      setSavedFlash(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveWarehouse(value: string) {
    setWarehouseId(value);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-artwork-warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_number: artwork.archive_number, warehouse_id: value || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error saving.');
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          className="table-checkbox"
          checked={selected}
          disabled={artwork.is_owned}
          onChange={onToggleSelect}
        />
      </td>
      <td>
        {artwork.featured_image_url ? (
          <img
            src={artwork.featured_image_url}
            alt={artwork.name}
            style={{ width: 40, height: 40, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: 40, height: 40, background: '#f0f0f0' }} />
        )}
      </td>
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
        <select
          value={editionType}
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value as Artwork['edition_type'];
            setEditionType(val);
            save({ edition_type: val });
          }}
          style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
        >
          <option value="unique">Unique</option>
          <option value="limited_edition">Limited Edition</option>
        </select>
      </td>

      {audience === 'collectors' ? (
        <>
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
              placeholder="e.g. 4500"
              style={{ width: 100, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
            />
          </td>
          <td style={{ textAlign: 'center', color: artwork.saved_count > 0 ? 'var(--ink)' : 'var(--ink-soft)' }}>
            {artwork.saved_count}
          </td>
        </>
      ) : (
        <>
          <td>
            <label className="switch">
              <input
                type="checkbox"
                checked={galleryVisible}
                disabled={loading}
                onChange={(e) => {
                  setGalleryVisible(e.target.checked);
                  saveAudience({ gallery_visible: e.target.checked });
                }}
              />
              <span className="switch-track" />
            </label>
          </td>
          <td>
            <input
              value={pricePartner}
              disabled={loading}
              onChange={(e) => setPricePartner(e.target.value)}
              onBlur={() => saveAudience({ price_partner: pricePartner })}
              placeholder="e.g. 3000"
              style={{ width: 100, padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
            />
          </td>
        </>
      )}

      <td>
        {artwork.is_owned ? (
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-soft)' }}>
            Sold
          </span>
        ) : (
          <select
            value={warehouseId}
            disabled={loading}
            onChange={(e) => saveWarehouse(e.target.value)}
            style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
          >
            <option value="">— None —</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}
      </td>

      <td style={{ fontSize: 11, minWidth: 70 }}>
        {error ? (
          <span style={{ color: '#b0281a' }}>{error}</span>
        ) : savedFlash ? (
          <span style={{ color: '#2f6b2f' }}>Saved ✓</span>
        ) : loading ? (
          <span style={{ color: 'var(--ink-soft)' }}>Saving…</span>
        ) : null}
      </td>
    </tr>
  );
}

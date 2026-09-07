'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtworkRow from './ArtworkRow';

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

export default function ArtworksTable({
  artworks,
  warehouses,
  audience,
}: {
  artworks: Artwork[];
  warehouses: Warehouse[];
  audience: 'collectors' | 'gallery';
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showSold, setShowSold] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWarehouse, setBulkWarehouse] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const soldCount = useMemo(() => artworks.filter((a) => a.is_owned).length, [artworks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return artworks.filter((a) => {
      const matchesSearch =
        !q || a.archive_number.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      // A search always overrides the sold filter, so looking up a specific
      // (possibly already sold) piece by name or archive number still works.
      if (!q && !showSold && a.is_owned) return false;
      return true;
    });
  }, [artworks, search, showSold]);

  const selectable = filtered.filter((a) => !a.is_owned);
  const allSelectableSelected =
    selectable.length > 0 && selectable.every((a) => selected.has(a.archive_number));

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
      if (allSelectableSelected) {
        const next = new Set(prev);
        selectable.forEach((a) => next.delete(a.archive_number));
        return next;
      }
      const next = new Set(prev);
      selectable.forEach((a) => next.add(a.archive_number));
      return next;
    });
  }

  async function handleBulkAssign() {
    if (selected.size === 0) return;
    setBulkError(null);
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/update-artwork-warehouse', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive_numbers: Array.from(selected),
          warehouse_id: bulkWarehouse || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBulkError(data.error || 'Error assigning warehouse.');
        return;
      }
      setSelected(new Set());
      setBulkWarehouse('');
      router.refresh();
    } catch {
      setBulkError('Unexpected error.');
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="field" style={{ maxWidth: 360, marginBottom: 0 }}>
          <label htmlFor="artwork-search">Search</label>
          <input
            id="artwork-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or archive no…"
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, paddingBottom: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
          Show sold ({soldCount})
        </label>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>{selected.size} selected</span>
          <select value={bulkWarehouse} onChange={(e) => setBulkWarehouse(e.target.value)}>
            <option value="">— No warehouse —</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <button className="btn" type="button" onClick={handleBulkAssign} disabled={bulkLoading}>
            {bulkLoading ? 'Assigning…' : 'Assign to Warehouse'}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={{ background: 'transparent', border: '1px solid var(--line)', padding: '13px 16px', fontSize: 12, cursor: 'pointer' }}
          >
            Clear
          </button>
          {bulkError && <span style={{ color: '#b0281a' }}>{bulkError}</span>}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">No matches.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={allSelectableSelected}
                  onChange={toggleAll}
                />
              </th>
              <th></th>
              <th>Archive No.</th>
              <th>Artwork</th>
              <th>Category</th>
              <th>Edition Type</th>
              {audience === 'collectors' ? (
                <>
                  <th>For Sale</th>
                  <th>Price (EUR)</th>
                  <th>Saved</th>
                </>
              ) : (
                <>
                  <th>Gallery Visibility</th>
                  <th>Partner Price (EUR)</th>
                </>
              )}
              <th>Warehouse</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <ArtworkRow
                key={a.archive_number}
                artwork={a}
                warehouses={warehouses}
                audience={audience}
                selected={selected.has(a.archive_number)}
                onToggleSelect={() => toggleOne(a.archive_number)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

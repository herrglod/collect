'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AvailableArtwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
  warehouse_id: number | null;
};

type Warehouse = { id: number; name: string };

const CATEGORY_LABEL: Record<AvailableArtwork['category'], string> = {
  artwork: 'Artwork',
  objects: 'Objects',
  fashion: 'Fashion',
};

export default function AvailableArtworksTable({
  artworks,
  warehouses,
}: {
  artworks: AvailableArtwork[];
  warehouses: Warehouse[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWarehouse, setBulkWarehouse] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [rowWarehouse, setRowWarehouse] = useState<Record<string, string>>(
    Object.fromEntries(artworks.map((a) => [a.archive_number, a.warehouse_id != null ? String(a.warehouse_id) : '']))
  );
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});

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

  async function handleRowWarehouseChange(archiveNumber: string, value: string) {
    setRowWarehouse((prev) => ({ ...prev, [archiveNumber]: value }));
    setRowLoading((prev) => ({ ...prev, [archiveNumber]: true }));
    try {
      await fetch('/api/admin/update-artwork-warehouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_number: archiveNumber, warehouse_id: value || null }),
      });
      router.refresh();
    } finally {
      setRowLoading((prev) => ({ ...prev, [archiveNumber]: false }));
    }
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
      <div className="field" style={{ maxWidth: 360, marginBottom: 24 }}>
        <label htmlFor="available-search">Search</label>
        <input
          id="available-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or archive no…"
        />
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
        <div className="empty-state">
          {artworks.length === 0 ? 'Every artwork in the archive is currently assigned.' : 'No matches.'}
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                />
              </th>
              <th></th>
              <th>Archive No.</th>
              <th>Artwork</th>
              <th>Category</th>
              <th>Edition Type</th>
              <th>For Sale</th>
              <th>Price (EUR)</th>
              <th>Warehouse</th>
              <th></th>
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
                  <select
                    value={rowWarehouse[a.archive_number] ?? ''}
                    disabled={rowLoading[a.archive_number]}
                    onChange={(e) => handleRowWarehouseChange(a.archive_number, e.target.value)}
                    style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
                  >
                    <option value="">— None —</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </td>
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

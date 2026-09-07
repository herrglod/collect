'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type WarehouseArtwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
};

type Warehouse = {
  id: number;
  name: string;
  location: string | null;
  artwork_count: number;
  artworks: WarehouseArtwork[];
};

export default function WarehouseTable({ warehouses }: { warehouses: Warehouse[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startEdit(w: Warehouse) {
    setEditing(w.id);
    setEditName(w.name);
    setEditLocation(w.location ?? '');
    setError(null);
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/update-warehouse', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName.trim(), location: editLocation.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Error saving.');
        setLoading(false);
        return;
      }
      setEditing(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (warehouses.length === 0) {
    return <div className="empty-state">No warehouses yet. Create your first one above.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th></th>
          <th>Warehouse</th>
          <th>Location</th>
          <th>Artworks Stored</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {warehouses.map((w) => {
          const isExpanded = expanded === w.id;
          const isEditing = editing === w.id;
          return (
            <Fragment key={w.id}>
              <tr>
                <td style={{ width: 24 }}>
                  {w.artwork_count > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : w.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: 'var(--ink-soft)',
                      }}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? '▾' : '▸'}
                    </button>
                  )}
                </td>
                {isEditing ? (
                  <>
                    <td>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, width: 160 }}
                      />
                    </td>
                    <td>
                      <input
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Location"
                        style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13, width: 180 }}
                      />
                    </td>
                    <td>{w.artwork_count}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" type="button" disabled={loading} onClick={() => saveEdit(w.id)}>
                        {loading ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        style={{ background: 'transparent', border: '1px solid var(--line)', padding: '10px 14px', fontSize: 12, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      style={{ cursor: w.artwork_count > 0 ? 'pointer' : 'default' }}
                      onClick={() => w.artwork_count > 0 && setExpanded(isExpanded ? null : w.id)}
                    >
                      {w.name}
                    </td>
                    <td>{w.location ?? '—'}</td>
                    <td>{w.artwork_count}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => startEdit(w)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--line)',
                          padding: '8px 12px',
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
              {isEditing && error && (
                <tr>
                  <td colSpan={5} className="error-msg" style={{ paddingTop: 0 }}>
                    {error}
                  </td>
                </tr>
              )}
              {isExpanded && (
                <tr>
                  <td></td>
                  <td colSpan={4} style={{ padding: '4px 12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {w.artworks.map((a) => (
                        <Link
                          key={a.archive_number}
                          href={`/admin/artworks?q=${a.archive_number}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
                        >
                          {a.featured_image_url ? (
                            <img
                              src={a.featured_image_url}
                              alt={a.name}
                              style={{ width: 32, height: 32, objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: 32, height: 32, background: '#f0f0f0' }} />
                          )}
                          <span style={{ fontSize: 13 }}>
                            {a.archive_number} — {a.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

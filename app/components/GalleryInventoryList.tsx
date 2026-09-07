'use client';

import { useMemo } from 'react';

type GalleryOwnership = {
  ownership_id: number;
  contact_id: number;
  contact_name: string;
  contact_email: string | null;
  archive_number: string;
  artwork_name: string;
  artwork_image: string | null;
  edition_number: string | null;
  delivered_at: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  owned: 'Owned',
  exhibited: 'Exhibited',
  stored: 'Stored',
  sold: 'Sold',
  retour_requested: 'Return requested',
};

export default function GalleryInventoryList({ ownerships }: { ownerships: GalleryOwnership[] }) {
  const groups = useMemo(() => {
    const map = new Map<number, { name: string; email: string | null; items: GalleryOwnership[] }>();
    for (const o of ownerships) {
      if (!map.has(o.contact_id)) {
        map.set(o.contact_id, { name: o.contact_name, email: o.contact_email, items: [] });
      }
      map.get(o.contact_id)!.items.push(o);
    }
    return Array.from(map.values());
  }, [ownerships]);

  if (groups.length === 0) {
    return <div className="empty-state">No artworks currently assigned to gallery partners.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {groups.map((group) => (
        <div key={group.name}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {group.name}
          </h3>
          {group.email && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>{group.email}</div>}
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Archive No.</th>
                <th>Artwork</th>
                <th>Edition</th>
                <th>Delivered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((o) => (
                <tr key={o.ownership_id}>
                  <td>
                    {o.artwork_image ? (
                      <img src={o.artwork_image} alt={o.artwork_name} style={{ width: 36, height: 36, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, background: '#f0f0f0' }} />
                    )}
                  </td>
                  <td>{o.archive_number}</td>
                  <td>{o.artwork_name}</td>
                  <td>{o.edition_number || 'Unique'}</td>
                  <td>{o.delivered_at ? new Date(o.delivered_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td>{STATUS_LABEL[o.status] ?? o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type InventoryItem = {
  ownership_id: number;
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  edition_number: string | null;
  delivered_at: string | null;
  status: string;
};

export default function PartnerInventoryTable({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function handleChange(ownershipId: number, status: string) {
    setLoading(ownershipId);
    try {
      const res = await fetch('/api/partner/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownership_id: ownershipId, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error updating status.');
      }
    } finally {
      setLoading(null);
    }
  }

  if (items.length === 0) {
    return <div className="empty-state">No artworks currently on commission.</div>;
  }

  return (
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
        {items.map((item) => (
          <tr key={item.ownership_id}>
            <td>
              {item.featured_image_url ? (
                <img src={item.featured_image_url} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 40, height: 40, background: '#f0f0f0' }} />
              )}
            </td>
            <td>{item.archive_number}</td>
            <td>{item.name}</td>
            <td>{item.edition_number || 'Unique'}</td>
            <td>{item.delivered_at ? new Date(item.delivered_at).toLocaleDateString('en-GB') : '—'}</td>
            <td>
              <select
                value={item.status}
                disabled={loading === item.ownership_id}
                onChange={(e) => handleChange(item.ownership_id, e.target.value)}
                style={{ padding: '6px 8px', border: '1px solid var(--line)', fontSize: 13 }}
              >
                <option value="exhibited">Exhibited</option>
                <option value="stored">Stored</option>
                <option value="sold">Sold</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

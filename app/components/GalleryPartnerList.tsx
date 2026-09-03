'use client';

import { useMemo } from 'react';
import OwnershipCard from './OwnershipCard';

type ActiveOwnership = {
  ownership_id: number;
  contact_id: number;
  contact_name: string;
  contact_email: string | null;
  archive_number: string;
  artwork_name: string;
  artwork_image: string | null;
  edition_number: string | null;
  acquired_at: string;
};

export default function GalleryPartnerList({ ownerships }: { ownerships: ActiveOwnership[] }) {
  const groups = useMemo(() => {
    const map = new Map<number, { name: string; email: string | null; items: ActiveOwnership[] }>();
    for (const o of ownerships) {
      if (!map.has(o.contact_id)) {
        map.set(o.contact_id, { name: o.contact_name, email: o.contact_email, items: [] });
      }
      map.get(o.contact_id)!.items.push(o);
    }
    return Array.from(map.values());
  }, [ownerships]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {groups.map((group) => (
        <div key={group.name}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {group.name}
          </h3>
          {group.email && (
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 16 }}>{group.email}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {group.items.map((o) => (
              <OwnershipCard key={o.ownership_id} ownership={o} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

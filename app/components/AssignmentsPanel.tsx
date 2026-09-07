'use client';

import { useMemo, useState } from 'react';
import OwnershipRow from './OwnershipRow';
import GalleryPartnerList from './GalleryPartnerList';

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

export default function AssignmentsPanel({
  ownerships,
  activeTab,
}: {
  ownerships: ActiveOwnership[];
  activeTab: 'collector' | 'gallery';
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ownerships;
    return ownerships.filter(
      (o) =>
        o.contact_name.toLowerCase().includes(q) ||
        o.archive_number.toLowerCase().includes(q) ||
        o.artwork_name.toLowerCase().includes(q)
    );
  }, [ownerships, search]);

  return (
    <div>
      <div className="field" style={{ maxWidth: 360, marginBottom: 24 }}>
        <label htmlFor="assignments-search">Search</label>
        <input
          id="assignments-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or archive no…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No matches.</div>
      ) : activeTab === 'gallery' ? (
        <GalleryPartnerList ownerships={filtered} />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Collector</th>
              <th>Archive No.</th>
              <th>Artwork</th>
              <th>Edition</th>
              <th>Since</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <OwnershipRow key={o.ownership_id} ownership={o} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

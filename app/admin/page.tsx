import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession, getSessionDisplayName } from '../../lib/auth-server';
import { query } from '../../lib/db';
import UserMenu from '../components/UserMenu';
import OwnershipRow from '../components/OwnershipRow';
import NewGalleryForm from '../components/NewGalleryForm';
import AdminNav from '../components/AdminNav';
import GalleryPartnerList from '../components/GalleryPartnerList';

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const activeTab = searchParams?.tab === 'gallery' ? 'gallery' : 'collector';
  const typeFilter = activeTab === 'gallery' ? "c.type = 'gallery'" : "c.type IS DISTINCT FROM 'gallery'";

  const ownerships = await query<ActiveOwnership>(
    `SELECT o.id AS ownership_id, c.id AS contact_id, c.name AS contact_name, c.email AS contact_email,
            o.archive_number, a.name AS artwork_name, a.featured_image_url AS artwork_image,
            o.edition_number, o.acquired_at
     FROM public.ownerships o
     JOIN public.contacts c ON c.id = o.contact_id
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.transferred_at IS NULL AND ${typeFilter}
     ORDER BY c.name ASC, o.acquired_at DESC`
  );

  const [{ count: artworkCount }] = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM public.artworks`
  );
  const [{ count: contactCount }] = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM public.contacts c WHERE ${typeFilter}`
  );
  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/admin" className="brand">
            GLOD <span>Collection</span>
          </Link>
        </div>
        <UserMenu name={displayName} />
      </header>

      <AdminNav active="assign" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Manage Assignments</h1>
      <p className="subtitle">
        {artworkCount} artworks in the archive · {contactCount} {activeTab === 'gallery' ? 'galleries' : 'collectors'} ·{' '}
        {ownerships.length} active assignments
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link href="/admin/assign" className="btn">
          + New Assignment
        </Link>
        {activeTab === 'gallery' && <NewGalleryForm />}
      </div>

      <div className="tabs">
        <Link href="/admin?tab=collector" className={`tab${activeTab === 'collector' ? ' active' : ''}`}>
          Collector
        </Link>
        <Link href="/admin?tab=gallery" className={`tab${activeTab === 'gallery' ? ' active' : ''}`}>
          Gallery Partner
        </Link>
      </div>

      <h2 className="section-title" style={{ marginTop: 32 }}>
        Active Assignments
      </h2>

      {ownerships.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'gallery' ? 'No gallery has any artworks assigned yet.' : 'No artworks assigned yet.'}
        </div>
      ) : activeTab === 'gallery' ? (
        <GalleryPartnerList ownerships={ownerships} />
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
            {ownerships.map((o) => (
              <OwnershipRow key={o.ownership_id} ownership={o} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

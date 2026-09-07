import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import AvailableArtworksTable from '../../components/AvailableArtworksTable';

type AvailableArtwork = {
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  year: number | null;
  for_sale: boolean;
  price_public: number | null;
  warehouse_id: number | null;
};

export default async function AdminAvailablePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  // Unique pieces are only "available" while nobody owns them yet. Limited Editions can have
  // several simultaneous owners (different collectors/partners each holding a copy), so they
  // should always stay assignable here regardless of existing ownerships — otherwise the system
  // wrongly treats the whole edition as "sold" after the very first copy is assigned.
  const artworks = await query<AvailableArtwork>(
    `SELECT a.archive_number, a.name, a.featured_image_url, a.category, a.edition_type, a.year,
            a.for_sale, a.price_public, a.warehouse_id
     FROM public.artworks a
     WHERE a.edition_type = 'limited_edition'
        OR NOT EXISTS (
             SELECT 1 FROM public.ownerships o
             WHERE o.archive_number = a.archive_number AND o.transferred_at IS NULL
           )
     ORDER BY a.archive_number ASC`
  );

  const warehouses = await query<{ id: number; name: string }>(
    `SELECT id, name FROM public.warehouses ORDER BY name ASC`
  );

  const [{ count: totalCount }] = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM public.artworks`
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

      <AdminNav active="available" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Available Artworks</h1>
      <p className="subtitle">
        {artworks.length} of {totalCount} artworks in the archive are available to assign — Unique
        pieces with no owner yet, plus all Limited Editions (which can have several owners at once).
      </p>

      <AvailableArtworksTable artworks={artworks} warehouses={warehouses} />
    </div>
  );
}

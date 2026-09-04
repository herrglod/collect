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
};

export default async function AdminAvailablePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const artworks = await query<AvailableArtwork>(
    `SELECT a.archive_number, a.name, a.featured_image_url, a.category, a.edition_type, a.year,
            a.for_sale, a.price_public
     FROM public.artworks a
     LEFT JOIN public.ownerships o ON o.archive_number = a.archive_number AND o.transferred_at IS NULL
     WHERE o.id IS NULL
     ORDER BY a.archive_number ASC`
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
        {artworks.length} of {totalCount} artworks in the archive currently have no owner assigned.
        Use this list to quickly find pieces you can assign to a collector or gallery partner.
      </p>

      <AvailableArtworksTable artworks={artworks} />
    </div>
  );
}

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import ArtworksTable from '../../components/ArtworksTable';

type Artwork = {
  archive_number: string;
  name: string;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
};

export default async function AdminArtworksPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const artworks = await query<Artwork>(
    `SELECT archive_number, name, category, edition_type, for_sale, price_public
     FROM public.artworks
     ORDER BY archive_number ASC`
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

      <AdminNav active="artworks" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Manage Artworks</h1>
      <p className="subtitle">
        Category and edition type automatically drive the collector statistics ("Unique Artwork" vs.
        "Limited Edition") — you no longer need to enter this separately when assigning to a collector.
        For-sale status and price drive the Exclusive section. All changes here are saved instantly and
        automatically to the central database, no save button needed — they take effect immediately
        everywhere on the platform (collector view, assignment form, Exclusive page).
      </p>

      <ArtworksTable artworks={artworks} />
    </div>
  );
}

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
  featured_image_url: string | null;
  category: 'artwork' | 'objects' | 'fashion';
  edition_type: 'unique' | 'limited_edition';
  for_sale: boolean;
  price_public: number | null;
  for_sale_audience: 'collectors' | 'gallery' | 'both';
  price_partner: number | null;
  saved_count: number;
  warehouse_id: number | null;
  is_owned: boolean;
};

export default async function AdminArtworksPage({
  searchParams,
}: {
  searchParams?: { audience?: string };
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const activeAudience = searchParams?.audience === 'gallery' ? 'gallery' : 'collectors';

  const artworks = await query<Artwork>(
    `SELECT a.archive_number, a.name, a.featured_image_url, a.category, a.edition_type, a.for_sale,
            a.price_public, a.for_sale_audience, a.price_partner, a.warehouse_id,
            COUNT(s.id)::int AS saved_count,
            (o.id IS NOT NULL) AS is_owned
     FROM public.artworks a
     LEFT JOIN public.artwork_saves s ON s.archive_number = a.archive_number
     LEFT JOIN public.ownerships o ON o.archive_number = a.archive_number AND o.transferred_at IS NULL
     GROUP BY a.archive_number, o.id
     ORDER BY a.archive_number ASC`
  );

  const warehouses = await query<{ id: number; name: string }>(
    `SELECT id, name FROM public.warehouses ORDER BY name ASC`
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
      <h1 className="title">For Sale</h1>
      <p className="subtitle">
        Category and edition type automatically drive the collector statistics ("Unique Artwork" vs.
        "Limited Edition") — you no longer need to enter this separately when assigning to a collector.
        All changes here are saved instantly and automatically, no save button needed. Use the tabs
        below to manage what collectors see in Exclusive versus what gallery partners see with their
        own pricing.
      </p>

      <div className="tabs" style={{ marginBottom: 32 }}>
        <Link href="/admin/artworks?audience=collectors" className={`tab${activeAudience === 'collectors' ? ' active' : ''}`}>
          Collectors
        </Link>
        <Link href="/admin/artworks?audience=gallery" className={`tab${activeAudience === 'gallery' ? ' active' : ''}`}>
          Gallery Partner
        </Link>
      </div>

      <ArtworksTable artworks={artworks} warehouses={warehouses} audience={activeAudience} />
    </div>
  );
}

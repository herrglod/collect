import { redirect } from 'next/navigation';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import ArtworkRow from '../../components/ArtworkRow';

type Artwork = {
  archive_number: string;
  name: string;
  category: 'artwork' | 'objects' | 'fashion';
  for_sale: boolean;
  price_public: number | null;
};

export default async function AdminArtworksPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const artworks = await query<Artwork>(
    `SELECT archive_number, name, category, for_sale, price_public
     FROM public.artworks
     ORDER BY archive_number ASC`
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <div className="brand">
            GLOD <span>Collection</span>
          </div>
        </div>
        <UserMenu name={displayName} />
      </header>

      <AdminNav active="artworks" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Kunstwerke verwalten</h1>
      <p className="subtitle">
        Kategorie (für die Sammler-Statistik) sowie Verkaufsstatus und Preis für den Exclusive-Bereich
        pflegen.
      </p>

      {artworks.length === 0 ? (
        <div className="empty-state">Keine Kunstwerke im Archiv.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Archive Nr.</th>
              <th>Werk</th>
              <th>Kategorie</th>
              <th>Zum Verkauf</th>
              <th>Preis (EUR)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((a) => (
              <ArtworkRow key={a.archive_number} artwork={a} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

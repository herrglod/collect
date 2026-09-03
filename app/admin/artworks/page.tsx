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
      <h1 className="title">Kunstwerke verwalten</h1>
      <p className="subtitle">
        Kategorie und Edition-Typ steuern die Sammler-Statistik ("Unique Artwork" vs. "Limited
        Edition") automatisch — du musst dies beim Zuordnen an einen Sammler nicht mehr extra
        eintragen. Verkaufsstatus und Preis steuern den Exclusive-Bereich. Alle Änderungen hier
        werden sofort und automatisch in der zentralen Datenbank gespeichert, ohne Speichern-Button —
        sie wirken sich direkt überall auf der Plattform aus (Sammler-Ansicht, Zuordnungsformular,
        Exclusive-Seite).
      </p>

      <ArtworksTable artworks={artworks} />
    </div>
  );
}

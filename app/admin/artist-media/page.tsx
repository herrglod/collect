import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query, queryOne } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import ArtistMediaForm from '../../components/ArtistMediaForm';

export default async function AdminArtistMediaPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const links = await query<{ key: string; label: string; section: string; url: string | null }>(
    `SELECT key, label, section, url FROM public.artist_media_links ORDER BY section, key`
  );
  const profile = await queryOne<{ photo_url: string | null; bio_short: string | null }>(
    `SELECT photo_url, bio_short FROM public.artist_media_profile WHERE id = 1`
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

      <AdminNav active="artist-media" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Artist Media</h1>
      <p className="subtitle">
        These links appear on the Gallery Partner portal under "Artist Media". Paste links to your
        own hosted files (Google Drive, Dropbox, etc.) — the platform doesn't host these files itself.
      </p>

      <ArtistMediaForm links={links} profile={profile ?? { photo_url: null, bio_short: null }} />
    </div>
  );
}

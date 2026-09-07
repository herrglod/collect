import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import GalleryAssignTable from '../../components/GalleryAssignTable';
import GalleryInventoryList from '../../components/GalleryInventoryList';

export default async function AdminGalleryPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const availableArtworks = await query(
    `SELECT a.archive_number, a.name, a.featured_image_url, a.category, a.edition_type, a.price_public
     FROM public.artworks a
     LEFT JOIN public.ownerships o ON o.archive_number = a.archive_number AND o.transferred_at IS NULL
     WHERE o.id IS NULL
     ORDER BY a.archive_number ASC`
  );

  const galleries = await query<{ id: number; name: string }>(
    `SELECT id, name FROM public.contacts WHERE type = 'gallery' ORDER BY name ASC`
  );

  const galleryOwnerships = await query(
    `SELECT o.id AS ownership_id, o.contact_id, c.name AS contact_name, c.email AS contact_email,
            o.archive_number, a.name AS artwork_name, a.featured_image_url AS artwork_image,
            o.edition_number, o.delivered_at, o.status
     FROM public.ownerships o
     JOIN public.contacts c ON c.id = o.contact_id
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE c.type = 'gallery' AND o.transferred_at IS NULL
     ORDER BY c.name ASC, a.archive_number ASC`
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

      <AdminNav active="gallery" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Gallery Partner Artworks</h1>
      <p className="subtitle">
        Assign available artworks to a gallery partner on commission, with the date they were delivered.
        The partner can then track and update their own inventory status from their portal.
      </p>

      <GalleryAssignTable artworks={availableArtworks as any} galleries={galleries} />

      <h2 style={{ fontSize: 18, marginTop: 56, marginBottom: 24 }}>Current Gallery Partner Inventory</h2>
      <GalleryInventoryList ownerships={galleryOwnerships as any} />
    </div>
  );
}

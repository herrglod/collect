import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import WarehouseForm from '../../components/WarehouseForm';
import WarehouseTable from '../../components/WarehouseTable';

type Warehouse = {
  id: number;
  name: string;
  location: string | null;
  artwork_count: number;
};

type WarehouseArtworkRow = {
  warehouse_id: number;
  archive_number: string;
  name: string;
  featured_image_url: string | null;
};

export default async function AdminWarehousesPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const warehouses = await query<Warehouse>(
    `SELECT w.id, w.name, w.location, COUNT(a.archive_number)::int AS artwork_count
     FROM public.warehouses w
     LEFT JOIN public.artworks a ON a.warehouse_id = w.id
     GROUP BY w.id
     ORDER BY w.name ASC`
  );

  const artworkRows = await query<WarehouseArtworkRow>(
    `SELECT a.warehouse_id, a.archive_number, a.name, a.featured_image_url
     FROM public.artworks a
     WHERE a.warehouse_id IS NOT NULL
     ORDER BY a.name ASC`
  );

  const warehousesWithArtworks = warehouses.map((w) => ({
    ...w,
    artworks: artworkRows.filter((a) => a.warehouse_id === w.id),
  }));

  const [{ count: unstoredCount }] = await query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM public.artworks a
     WHERE a.warehouse_id IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.ownerships o WHERE o.archive_number = a.archive_number AND o.transferred_at IS NULL
       )`
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

      <AdminNav active="warehouses" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Warehouses</h1>
      <p className="subtitle">
        Track where each artwork is physically stored. This is separate from ownership — an artwork
        keeps its warehouse until it is assigned to a collector, at which point it automatically
        counts as sold. Manage the warehouse for each artwork under{' '}
        <Link href="/admin/available">Available</Link> or <Link href="/admin/artworks">For Sale</Link>.
      </p>

      <WarehouseForm />

      <WarehouseTable warehouses={warehousesWithArtworks} />

      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 24 }}>
        {unstoredCount} unsold artwork{unstoredCount === '1' ? '' : 's'} currently have no warehouse assigned.
      </p>
    </div>
  );
}

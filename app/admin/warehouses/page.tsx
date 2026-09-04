import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import WarehouseForm from '../../components/WarehouseForm';

type Warehouse = {
  id: number;
  name: string;
  location: string | null;
  artwork_count: number;
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

      {warehouses.length === 0 ? (
        <div className="empty-state">No warehouses yet. Create your first one above.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Location</th>
              <th>Artworks Stored</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.location ?? '—'}</td>
                <td>{w.artwork_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 24 }}>
        {unstoredCount} unsold artwork{unstoredCount === '1' ? '' : 's'} currently have no warehouse assigned.
      </p>
    </div>
  );
}

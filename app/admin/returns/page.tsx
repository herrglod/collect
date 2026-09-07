import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import ReturnRequestRow from '../../components/ReturnRequestRow';

export default async function AdminReturnsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const returns = await query(
    `SELECT o.id AS ownership_id, o.archive_number, a.name AS artwork_name,
            c.name AS contact_name, c.email AS contact_email, o.updated_at
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     JOIN public.contacts c ON c.id = o.contact_id
     WHERE o.status = 'retour_requested' AND o.transferred_at IS NULL
     ORDER BY o.updated_at DESC`
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

      <AdminNav active="returns" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Return Requests</h1>
      <p className="subtitle">
        Collectors or gallery partners who have asked to return an artwork currently assigned to them.
      </p>

      {returns.length === 0 ? (
        <div className="empty-state">No pending return requests.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Artwork</th>
              <th>Requested</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r: any) => (
              <ReturnRequestRow key={r.ownership_id} row={r} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

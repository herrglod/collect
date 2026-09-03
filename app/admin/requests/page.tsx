import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import RequestRow from '../../components/RequestRow';

type ConnectRequest = {
  id: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  contact_name: string;
  contact_email: string | null;
};

export default async function AdminRequestsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const requests = await query<ConnectRequest>(
    `SELECT r.id, r.description, r.status, r.created_at, c.name AS contact_name, c.email AS contact_email
     FROM public.connect_requests r
     JOIN public.contacts c ON c.id = r.contact_id
     ORDER BY (r.status = 'pending') DESC, r.created_at DESC`
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

      <AdminNav active="requests" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Connect Art Requests</h1>
      <p className="subtitle">
        Verify that the collector actually acquired the artwork described before linking it to their
        account via "Assign Artwork".
      </p>

      {requests.length === 0 ? (
        <div className="empty-state">No requests yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Collector</th>
              <th>Description</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <RequestRow key={r.id} request={r} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

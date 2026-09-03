import { redirect } from 'next/navigation';
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
          <div className="brand">
            GLOD <span>Collection</span>
          </div>
        </div>
        <UserMenu name={displayName} />
      </header>

      <AdminNav active="requests" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Connect-Art-Anfragen</h1>
      <p className="subtitle">
        Prüfe, ob Sammler die angegebenen Kunstwerke wirklich erworben haben, bevor du sie über
        "Kunstwerk zuordnen" mit ihrem Account verknüpfst.
      </p>

      {requests.length === 0 ? (
        <div className="empty-state">Noch keine Anfragen.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sammler</th>
              <th>Beschreibung</th>
              <th>Eingereicht</th>
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

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import ConnectArtForm from '../../components/ConnectArtForm';

type RequestRow = {
  id: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export default async function ConnectArtPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const requests = await query<RequestRow>(
    `SELECT id, description, status, created_at
     FROM public.connect_requests
     WHERE contact_id = $1
     ORDER BY created_at DESC`,
    [session.contactId]
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <div className="brand">
            GLOD <span>Collection</span>
          </div>
          <nav className="primary-nav">
            <Link href="/collector">My Collection</Link>
            <Link href="/collector/news">News</Link>
            <Link href="/collector/exclusive">Exclusive</Link>
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <div className="eyebrow">Connect Art</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Own More GLOD Art?
      </h1>
      <p className="subtitle">
        Let us know if you have acquired a GLOD artwork that is not yet showing up in your collection.
        Our team will review your request and link it to your account once verified.
      </p>

      <ConnectArtForm />

      {requests.length > 0 && (
        <>
          <h2 className="section-title">Your Requests</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString('en-US')}</td>
                  <td>{r.description}</td>
                  <td>
                    <span className={`status-pill ${r.status}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

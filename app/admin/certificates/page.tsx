import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import CertificateRequestRow from '../../components/CertificateRequestRow';

export default async function AdminCertificatesPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const requests = await query(
    `SELECT cr.id, cr.archive_number, a.name AS artwork_name, c.name AS contact_name, c.email AS contact_email,
            cr.status, cr.created_at
     FROM public.certificate_requests cr
     JOIN public.artworks a ON a.archive_number = cr.archive_number
     JOIN public.contacts c ON c.id = cr.contact_id
     ORDER BY (cr.status = 'pending') DESC, cr.created_at DESC`
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

      <AdminNav active="certificates" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Certificate Requests</h1>
      <p className="subtitle">
        Collectors requesting a physical certification and Archive connection for artworks they own.
      </p>

      {requests.length === 0 ? (
        <div className="empty-state">No certificate requests yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Collector</th>
              <th>Artwork</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r: any) => (
              <CertificateRequestRow key={r.id} request={r} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

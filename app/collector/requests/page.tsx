import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';

type ConnectRequest = {
  id: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type PurchaseInquiry = {
  id: number;
  archive_number: string;
  artwork_name: string;
  fulfillment: 'pickup' | 'shipping';
  contact_method: 'email' | 'whatsapp';
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
};

export default async function CollectorRequestsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const connectRequests = await query<ConnectRequest>(
    `SELECT id, description, status, created_at
     FROM public.connect_requests
     WHERE contact_id = $1
     ORDER BY created_at DESC`,
    [session.contactId]
  );

  const purchaseInquiries = await query<PurchaseInquiry>(
    `SELECT i.id, i.archive_number, a.name AS artwork_name, i.fulfillment, i.contact_method, i.status, i.created_at
     FROM public.purchase_inquiries i
     JOIN public.artworks a ON a.archive_number = i.archive_number
     WHERE i.contact_id = $1
     ORDER BY i.created_at DESC`,
    [session.contactId]
  );

  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <Link href="/collector" className="brand">
            GLOD <span>Collection</span>
          </Link>
          <nav className="primary-nav">
            <Link href="/collector">My Artworks</Link>
            <Link href="/collector/news">News</Link>
            <Link href="/collector/exclusive">Exclusive</Link>
            <Link href="/collector/events">Events</Link>
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">My Requests</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Requests &amp; Inquiries
      </h1>
      <p className="subtitle">Track the status of what you've submitted to the GLOD team.</p>

      <h2 className="section-title" style={{ marginTop: 0 }}>
        Connect Art Requests
      </h2>
      {connectRequests.length === 0 ? (
        <div className="empty-state">
          No requests yet. If you own a piece not yet linked to your account,{' '}
          <Link href="/collector/connect-art">let us know</Link>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          {connectRequests.map((r) => (
            <div
              key={r.id}
              style={{
                border: '1px solid var(--line)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{r.description}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>
                  Submitted {new Date(r.created_at).toLocaleDateString('en-GB')}
                </div>
              </div>
              <span className={`status-pill ${r.status}`} style={{ height: 'fit-content', flexShrink: 0 }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Purchase Inquiries</h2>
      {purchaseInquiries.length === 0 ? (
        <div className="empty-state">
          No purchase inquiries yet. Browse the <Link href="/collector/exclusive">Exclusive</Link>{' '}
          section to see what's available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {purchaseInquiries.map((i) => (
            <div
              key={i.id}
              style={{
                border: '1px solid var(--line)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {i.artwork_name}{' '}
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>({i.archive_number})</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {i.fulfillment === 'shipping' ? 'Shipping' : 'Pick-Up'} ·{' '}
                  {i.contact_method === 'whatsapp' ? 'WhatsApp' : 'Email'} · Submitted{' '}
                  {new Date(i.created_at).toLocaleDateString('en-GB')}
                </div>
              </div>
              <span className={`status-pill ${i.status}`} style={{ height: 'fit-content', flexShrink: 0 }}>
                {i.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

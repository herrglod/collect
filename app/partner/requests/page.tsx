import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';
import { query } from '../../../lib/db';

type PurchaseInquiry = {
  id: number;
  archive_number: string;
  artwork_name: string;
  fulfillment: 'pickup' | 'shipping';
  contact_method: 'email' | 'whatsapp';
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
};

export default async function PartnerRequestsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/partner');

  const purchaseInquiries = await query<PurchaseInquiry>(
    `SELECT i.id, i.archive_number, a.name AS artwork_name, i.fulfillment, i.contact_method, i.status, i.created_at
     FROM public.purchase_inquiries i
     JOIN public.artworks a ON a.archive_number = i.archive_number
     WHERE i.contact_id = $1
     ORDER BY i.created_at DESC`,
    [session.contactId]
  );

  return (
    <>
      <div className="eyebrow">Gallery Partner</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        My Requests
      </h1>
      <p className="subtitle">Track the status of the inquiries you've submitted to the GLOD team.</p>

      {purchaseInquiries.length === 0 ? (
        <div className="empty-state">
          No inquiries yet. Browse <Link href="/partner/available">Available Works</Link> to see
          what's on offer.
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
    </>
  );
}

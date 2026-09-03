import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import InquiryRow from '../../components/InquiryRow';

type Inquiry = {
  id: number;
  archive_number: string;
  artwork_name: string;
  fulfillment: 'pickup' | 'shipping';
  shipping_city: string | null;
  shipping_country: string | null;
  contact_method: 'email' | 'whatsapp';
  contact_value: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
  contact_name: string;
};

export default async function AdminInquiriesPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const inquiries = await query<Inquiry>(
    `SELECT i.id, i.archive_number, a.name AS artwork_name, i.fulfillment, i.shipping_city,
            i.shipping_country, i.contact_method, i.contact_value, i.message, i.status, i.created_at,
            c.name AS contact_name
     FROM public.purchase_inquiries i
     JOIN public.artworks a ON a.archive_number = i.archive_number
     JOIN public.contacts c ON c.id = i.contact_id
     ORDER BY (i.status = 'pending') DESC, i.created_at DESC`
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

      <AdminNav active="inquiries" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Purchase Inquiries</h1>
      <p className="subtitle">Inquiries submitted from the collector Exclusive section.</p>

      {inquiries.length === 0 ? (
        <div className="empty-state">No purchase inquiries yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inquiries.map((i) => (
            <InquiryRow key={i.id} inquiry={i} />
          ))}
        </div>
      )}
    </div>
  );
}

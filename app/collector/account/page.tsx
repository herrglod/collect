import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';
import { queryOne } from '../../../lib/db';
import AccountForm from '../../components/AccountForm';
import PasswordForm from '../../components/PasswordForm';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const contact = await queryOne<{
    name: string;
    email: string | null;
    phone: string | null;
    instagram: string | null;
    city: string | null;
    country: string | null;
  }>(
    `SELECT name, email, phone, instagram, city, country FROM public.contacts WHERE id = $1`,
    [session.contactId]
  );

  return (
    <>
      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Account</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Your Details
      </h1>
      <p className="subtitle">Keep your contact information up to date.</p>

      <div
        style={{
          border: '1px solid var(--line)',
          padding: '14px 18px',
          fontSize: 13,
          marginBottom: 32,
          background: '#fafafa',
        }}
      >
        Please keep your details current — it's how we reach you about events happening near you, or if
        there's a query regarding an artwork you own.
      </div>

      <AccountForm initial={contact ?? { name: '', email: '', phone: '', instagram: '', city: '', country: '' }} />

      <PasswordForm />
    </>
  );
}

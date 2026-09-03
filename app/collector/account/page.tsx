import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { queryOne } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
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

      <div className="eyebrow">Account</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Your Details
      </h1>
      <p className="subtitle">Keep your contact information up to date.</p>

      <AccountForm initial={contact ?? { name: '', email: '', phone: '', instagram: '', city: '', country: '' }} />

      <PasswordForm />
    </div>
  );
}

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { queryOne } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import SettingsForm from '../../components/SettingsForm';

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const contact = await queryOne<{ pref_contact_email: boolean; pref_contact_phone: boolean }>(
    `SELECT pref_contact_email, pref_contact_phone FROM public.contacts WHERE id = $1`,
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

      <div className="eyebrow">Settings</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Preferences
      </h1>
      <p className="subtitle">
        Choose how the GLOD team should reach out to you when there is a question about one of your
        artworks or a new inquiry.
      </p>

      <SettingsForm
        initial={{
          prefEmail: contact?.pref_contact_email ?? true,
          prefPhone: contact?.pref_contact_phone ?? false,
        }}
      />
    </div>
  );
}

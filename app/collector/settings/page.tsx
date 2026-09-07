import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';
import { queryOne } from '../../../lib/db';
import SettingsForm from '../../components/SettingsForm';

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const contact = await queryOne<{
    pref_contact_email: boolean;
    pref_contact_phone: boolean;
    pref_news_email: boolean;
  }>(
    `SELECT pref_contact_email, pref_contact_phone, pref_news_email FROM public.contacts WHERE id = $1`,
    [session.contactId]
  );

  return (
    <>
      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

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
          prefNewsEmail: contact?.pref_news_email ?? true,
        }}
      />
    </>
  );
}

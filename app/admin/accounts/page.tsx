import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import AdminAccountRow from '../../components/AdminAccountRow';

type ContactAccount = {
  contact_id: number;
  name: string;
  type: string;
  contact_email: string | null;
  contact_phone: string | null;
  platform_user_id: number | null;
  login_email: string | null;
  role: string | null;
};

export default async function AdminAccountsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const contacts = await query<ContactAccount>(
    `SELECT c.id AS contact_id, c.name, c.type, c.email AS contact_email, c.phone AS contact_phone,
            pu.id AS platform_user_id, pu.email AS login_email, pu.role
     FROM public.contacts c
     LEFT JOIN public.platform_users pu ON pu.contact_id = c.id
     ORDER BY (pu.id IS NULL) DESC, c.name ASC`
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

      <AdminNav active="accounts" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Zugänge</h1>
      <p className="subtitle">
        Login-Zugänge für Sammler anlegen oder Passwörter zurücksetzen. Das temporäre Passwort wird nur
        einmal angezeigt — bitte direkt und sicher an den Sammler weitergeben.
      </p>

      {contacts.length === 0 ? (
        <div className="empty-state">Noch keine Kontakte vorhanden.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map((c) => (
            <AdminAccountRow key={c.contact_id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}

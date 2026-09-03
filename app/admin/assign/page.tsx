import { redirect } from 'next/navigation';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AssignForm from '../../components/AssignForm';

export default async function AssignPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const contacts = await query<{ id: number; name: string; email: string | null; type: string | null }>(
    `SELECT id, name, email, type FROM public.contacts ORDER BY name ASC`
  );
  const artworks = await query<{ archive_number: string; name: string }>(
    `SELECT archive_number, name FROM public.artworks ORDER BY archive_number ASC`
  );
  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <div className="brand">
            GLOD <span>Archive</span>
          </div>
        </div>
        <UserMenu name={displayName} />
      </header>

      <div className="eyebrow">Admin</div>
      <h1 className="title">Kunstwerk zuordnen</h1>
      <p className="subtitle">
        Ordne ein Kunstwerk aus dem Archiv einem Kontakt zu (Sammler oder Gallery Partner). Bei
        Limited Editions kann zusätzlich die konkrete Exemplar-Nummer erfasst werden.
      </p>

      <AssignForm contacts={contacts} artworks={artworks} />
    </div>
  );
}

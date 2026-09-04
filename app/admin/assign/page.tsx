import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AssignForm from '../../components/AssignForm';

export default async function AssignPage({
  searchParams,
}: {
  searchParams?: { archive_number?: string };
}) {
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
          <Link href="/admin" className="brand">
            GLOD <span>Collection</span>
          </Link>
        </div>
        <UserMenu name={displayName} />
      </header>

      <Link href="/admin" className="back-link">
        ← Back to Assignments
      </Link>

      <div className="eyebrow">Admin</div>
      <h1 className="title">Assign Artwork</h1>
      <p className="subtitle">
        Assign an artwork from the archive to a contact (collector or gallery partner). For limited
        editions, you can also record the specific edition number.
      </p>

      <AssignForm contacts={contacts} artworks={artworks} initialArchiveNumber={searchParams?.archive_number} />
    </div>
  );
}

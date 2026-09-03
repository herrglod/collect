import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { queryOne } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import InquiryForm from '../../components/InquiryForm';

export default async function InquirePage({
  searchParams,
}: {
  searchParams?: { archive_number?: string; name?: string };
}) {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const archiveNumber = searchParams?.archive_number || '';
  const artworkName = searchParams?.name || '';

  if (!archiveNumber) {
    redirect('/collector/exclusive');
  }

  const contact = await queryOne<{ email: string | null; phone: string | null }>(
    `SELECT email, phone FROM public.contacts WHERE id = $1`,
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

      <Link href="/collector/exclusive" className="back-link">
        ← Back to Exclusive
      </Link>

      <div className="eyebrow">Inquiry</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        {artworkName || archiveNumber}
      </h1>
      <p className="subtitle">
        Let us know how you'd like to receive the piece and how to best reach you — the GLOD team
        will follow up shortly.
      </p>

      <InquiryForm
        archiveNumber={archiveNumber}
        artworkName={artworkName}
        defaultEmail={contact?.email || ''}
        defaultPhone={contact?.phone || ''}
      />
    </div>
  );
}

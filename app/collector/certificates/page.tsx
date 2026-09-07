import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import CertificateRequestForm from '../../components/CertificateRequestForm';

export default async function CertificatesPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) redirect('/collector');

  const owned = await query<{ archive_number: string; name: string; edition_type: 'unique' | 'limited_edition' }>(
    `SELECT a.archive_number, a.name, a.edition_type
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.contact_id = $1 AND o.transferred_at IS NULL AND o.status != 'sold'
     ORDER BY o.acquired_at DESC`,
    [session.contactId]
  );

  const requested = await query<{ archive_number: string }>(
    `SELECT archive_number FROM public.certificate_requests
     WHERE contact_id = $1 AND status IN ('pending', 'contacted')`,
    [session.contactId]
  );
  const requestedSet = new Set(requested.map((r) => r.archive_number));

  const artworks = owned.map((a) => ({ ...a, already_requested: requestedSet.has(a.archive_number) }));

  return (
    <>
      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Certificates</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Your Certificate of Authenticity
      </h1>
      <p className="subtitle" style={{ maxWidth: 640 }}>
        Owning an artwork through GLOD Collectors already is your digital certificate of
        authenticity — your ownership is permanently recorded here, tied to the Archive Number and
        full provenance of the piece. In most cases, you don't need anything more.
      </p>

      <h2 className="section-title" style={{ marginTop: 0 }}>Want to take it further?</h2>
      <p style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        If you'd like to bring that same authenticity into the physical world — to present the work
        professionally, to tell its story to guests, or simply to hold a tangible piece of its
        history — you can apply for the <strong>GLOD Archive Certification</strong>. It connects your
        artwork directly to its full exhibition history and story on the official GLOD Archive, and
        includes:
      </p>
      <ul style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.8, marginBottom: 32, paddingLeft: 20 }}>
        <li>
          A printed certificate bearing the Archive Number and a QR authentication code, linked
          directly to the artwork's page on the GLOD Archive — its exhibition history and story, always
          up to date.
        </li>
        <li>3 wall description stickers, for displaying the piece professionally for guests.</li>
        <li>An authentication sticker for the back of the artwork itself, marking it as verified.</li>
      </ul>
      <p style={{ maxWidth: 640, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
        Certified artworks with a documented history are also what will be eligible for resale on
        the upcoming GLOD Marketplace — this is a good first step if you may ever want to offer a
        piece to the community.
      </p>

      <div
        style={{
          border: '1px solid var(--line)',
          padding: '14px 18px',
          fontSize: 13,
          marginBottom: 32,
          background: '#fafafa',
        }}
      >
        Certification costs <strong>$50</strong> for a unique original artwork, and <strong>$25</strong> for a
        print edition. Select the artworks below and our team will follow up to arrange payment and
        delivery.
      </div>

      <CertificateRequestForm artworks={artworks} />
    </>
  );
}

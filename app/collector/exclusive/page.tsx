import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';

type ForSaleArtwork = {
  archive_number: string;
  name: string;
  year: number | null;
  medium: string | null;
  size: string | null;
  featured_image_url: string | null;
  price_public: number | null;
  category: string;
};

export default async function ExclusivePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const artworks = await query<ForSaleArtwork>(
    `SELECT archive_number, name, year, medium, size, featured_image_url, price_public, category
     FROM public.artworks
     WHERE for_sale = true
     ORDER BY updated_at DESC`
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
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Exclusive</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Available Works &amp; Specials
      </h1>

      <div className="exclusive-banner">
        This selection of artworks and objects is <strong>not publicly available</strong>. You are
        seeing it because you are an existing GLOD collector — prices shown here are{' '}
        <strong>exclusive collector pricing</strong>, offered only to members of the collection.
      </div>

      {artworks.length === 0 ? (
        <div className="empty-state">
          Nothing available right now — check back soon, or{' '}
          <Link href="/collector/connect-art">get in touch</Link> if you are looking for something
          specific.
        </div>
      ) : (
        <div className="grid">
          {artworks.map((art) => (
            <div className="card" key={art.archive_number}>
              {art.featured_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="card-image"
                  src={art.featured_image_url}
                  alt={art.name}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="card-image" />
              )}
              <div className="card-body">
                <div className="card-number">{art.archive_number}</div>
                <h3 className="card-title">{art.name}</h3>
                <div className="card-meta">
                  {[art.year, art.medium, art.size].filter(Boolean).join(' · ')}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    gap: 12,
                  }}
                >
                  {art.price_public != null ? (
                    <div className="exclusive-price" style={{ marginTop: 0 }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(
                        art.price_public
                      )}
                    </div>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/collector/connect-art?archive_number=${encodeURIComponent(
                      art.archive_number
                    )}&name=${encodeURIComponent(art.name)}`}
                    className="btn"
                    style={{ padding: '9px 16px', fontSize: 11 }}
                  >
                    Inquire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession, getSessionDisplayName } from '../../lib/auth-server';
import { query } from '../../lib/db';
import UserMenu from '../components/UserMenu';

type OwnedArtwork = {
  ownership_id: number;
  archive_number: string;
  edition_number: string | null;
  acquired_at: string;
  name: string;
  year: number | null;
  medium: string | null;
  size: string | null;
  rarity: string | null;
  description: string | null;
  featured_image_url: string | null;
  webflow_item_id: string | null;
  category: string;
  edition_type: string;
};

type Exhibition = {
  id: string;
  name: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  duration: string | null;
  year: number | null;
  hero_image_url: string | null;
  exhibition_type: string | null;
};

export default async function CollectorPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  if (!session.contactId) {
    return (
      <div className="page">
        <div className="empty-state">
          This account is not linked to a contact record. Please reach out to the GLOD team.
        </div>
      </div>
    );
  }

  const artworks = await query<OwnedArtwork>(
    `SELECT o.id AS ownership_id, o.archive_number, o.edition_number, o.acquired_at,
            a.name, a.year, a.medium, a.size, a.rarity, a.description,
            a.featured_image_url, a.webflow_item_id, a.category, a.edition_type
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.contact_id = $1 AND o.transferred_at IS NULL
     ORDER BY o.acquired_at DESC`,
    [session.contactId]
  );

  const uniqueCount = artworks.filter((a) => a.category === 'artwork' && a.edition_type === 'unique').length;
  const limitedCount = artworks.filter(
    (a) => a.category === 'artwork' && a.edition_type === 'limited_edition'
  ).length;
  const objectsCount = artworks.filter((a) => a.category === 'objects').length;
  const fashionCount = artworks.filter((a) => a.category === 'fashion').length;

  const ownedWebflowIds = artworks.map((a) => a.webflow_item_id).filter(Boolean) as string[];

  const relatedExhibitions =
    ownedWebflowIds.length > 0
      ? await query<Exhibition>(
          `SELECT id, name, venue, city, country, duration, year, hero_image_url, exhibition_type
           FROM public.exhibitions
           WHERE published = true AND artwork_webflow_ids && $1::text[]
           ORDER BY created_at DESC`,
          [ownedWebflowIds]
        )
      : [];

  const relatedIds = new Set(relatedExhibitions.map((e) => e.id));

  const otherExhibitions = await query<Exhibition>(
    `SELECT id, name, venue, city, country, duration, year, hero_image_url, exhibition_type
     FROM public.exhibitions
     WHERE published = true
     ORDER BY created_at DESC
     LIMIT 8`
  );

  const generalExhibitions = otherExhibitions.filter((e) => !relatedIds.has(e.id)).slice(0, 6);
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

      <div className="eyebrow">Collector Area</div>
      <h1 className="title">My Collection</h1>
      <p className="subtitle">
        {artworks.length === 0
          ? 'No artworks are linked to your account yet.'
          : `${artworks.length} piece${artworks.length === 1 ? '' : 's'} in your possession.`}
      </p>

      <div className="stats-bar">
        <div className="stat-label">My Holdings</div>
        <div className="stat-item stat-highlight">
          <div className="stat-value">{uniqueCount}</div>
          <div className="stat-name">Unique Artwork{uniqueCount === 1 ? '' : 's'}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{limitedCount}</div>
          <div className="stat-name">Limited Edition{limitedCount === 1 ? '' : 's'}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{objectsCount}</div>
          <div className="stat-name">Object{objectsCount === 1 ? '' : 's'}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{fashionCount}</div>
          <div className="stat-name">Fashion Item{fashionCount === 1 ? '' : 's'}</div>
        </div>
      </div>

      {uniqueCount === 0 && (
        <div className="cta-banner">
          You currently hold only Limited Editions or objects. <strong>Unique originals</strong> from
          the archive are available to existing collectors — visit the{' '}
          <Link href="/collector/exclusive">Exclusive</Link> area or{' '}
          <Link href="/collector/connect-art">get in touch</Link> to learn more.
        </div>
      )}

      {artworks.length === 0 ? (
        <div className="empty-state">
          As soon as the GLOD team links a piece to your account, it will appear here.
        </div>
      ) : (
        <div className="grid">
          {artworks.map((art) => (
            <div className="card" key={art.ownership_id}>
              {art.featured_image_url ? (
                <img className="card-image" src={art.featured_image_url} alt={art.name} />
              ) : (
                <div className="card-image" />
              )}
              <div className="card-body">
                <div className="card-number">{art.archive_number}</div>
                <h3 className="card-title">{art.name}</h3>
                <div className="card-meta">
                  {[art.year, art.medium, art.size].filter(Boolean).join(' · ')}
                </div>
                {art.edition_number && (
                  <div className="badge">Edition Number: {art.edition_number}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {relatedExhibitions.length > 0 && (
        <>
          <h2 className="section-title">Exhibition History of Your Works</h2>
          <div className="grid">
            {relatedExhibitions.map((ex) => (
              <div className="card" key={ex.id}>
                {ex.hero_image_url ? (
                  <img className="card-image" src={ex.hero_image_url} alt={ex.name} />
                ) : (
                  <div className="card-image" />
                )}
                <div className="card-body">
                  <div className="card-number">{ex.year ?? ''}</div>
                  <h3 className="card-title">{ex.name}</h3>
                  <div className="card-meta">
                    {[ex.venue, ex.city, ex.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {generalExhibitions.length > 0 && (
        <>
          <h2 className="section-title">Exhibitions &amp; Collaborations</h2>
          <div className="grid">
            {generalExhibitions.map((ex) => (
              <div className="card" key={ex.id}>
                {ex.hero_image_url ? (
                  <img className="card-image" src={ex.hero_image_url} alt={ex.name} />
                ) : (
                  <div className="card-image" />
                )}
                <div className="card-body">
                  <div className="card-number">{ex.exhibition_type || 'Project'}{ex.year ? ` · ${ex.year}` : ''}</div>
                  <h3 className="card-title">{ex.name}</h3>
                  <div className="card-meta">
                    {[ex.venue, ex.city, ex.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

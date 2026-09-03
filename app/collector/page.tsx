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
          Dieser Account ist keinem Kontakt zugeordnet. Bitte wende dich an das GLOD-Team.
        </div>
      </div>
    );
  }

  const artworks = await query<OwnedArtwork>(
    `SELECT o.id AS ownership_id, o.archive_number, o.edition_number, o.acquired_at,
            a.name, a.year, a.medium, a.size, a.rarity, a.description,
            a.featured_image_url, a.webflow_item_id
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.contact_id = $1 AND o.transferred_at IS NULL
     ORDER BY o.acquired_at DESC`,
    [session.contactId]
  );

  const ownedWebflowIds = artworks.map((a) => a.webflow_item_id).filter(Boolean) as string[];

  const relatedExhibitions =
    ownedWebflowIds.length > 0
      ? await query<Exhibition>(
          `SELECT id, name, venue, city, country, duration, year, hero_image_url
           FROM public.exhibitions
           WHERE published = true AND artwork_webflow_ids && $1::text[]
           ORDER BY year DESC NULLS LAST`,
          [ownedWebflowIds]
        )
      : [];

  const relatedIds = new Set(relatedExhibitions.map((e) => e.id));

  const otherExhibitions = await query<Exhibition>(
    `SELECT id, name, venue, city, country, duration, year, hero_image_url
     FROM public.exhibitions
     WHERE published = true
     ORDER BY year DESC NULLS LAST
     LIMIT 8`
  );

  const generalExhibitions = otherExhibitions.filter((e) => !relatedIds.has(e.id)).slice(0, 6);
  const displayName = await getSessionDisplayName(session);

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-left">
          <div className="brand">
            GLOD <span>Archive</span>
          </div>
          <nav className="primary-nav">
            <Link href="/collector">My Collection</Link>
            <Link href="#">News</Link>
            <Link href="#">Exklusive</Link>
          </nav>
        </div>
        <UserMenu name={displayName} />
      </header>

      <div className="eyebrow">Sammler-Bereich</div>
      <h1 className="title">Meine Sammlung</h1>
      <p className="subtitle">
        {artworks.length === 0
          ? 'Dir sind aktuell noch keine Kunstwerke zugeordnet.'
          : `${artworks.length} Werk${artworks.length === 1 ? '' : 'e'} in deinem Besitz.`}
      </p>

      {artworks.length === 0 ? (
        <div className="empty-state">
          Sobald dir das GLOD-Team ein Kunstwerk zuordnet, erscheint es hier.
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
          <h2 className="section-title">Ausstellungshistorie deiner Werke</h2>
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
          <h2 className="section-title">Aktuelle Ausstellungen &amp; Projekte</h2>
          <div className="grid">
            {generalExhibitions.map((ex) => (
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
    </div>
  );
}

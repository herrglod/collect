import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
};

export default async function CollectorEventsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const upcoming = await query<Event>(
    `SELECT id, title, description, event_date, location, image_url
     FROM public.events
     WHERE event_date >= CURRENT_DATE
     ORDER BY event_date ASC`
  );

  const past = await query<Event>(
    `SELECT id, title, description, event_date, location, image_url
     FROM public.events
     WHERE event_date < CURRENT_DATE
     ORDER BY event_date DESC
     LIMIT 6`
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

      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Events</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Upcoming Events
      </h1>
      <p className="subtitle">Exclusive invitations for members of the GLOD Collectors Circle.</p>

      {upcoming.length === 0 ? (
        <div className="empty-state">No upcoming events right now — check back soon.</div>
      ) : (
        <div className="grid">
          {upcoming.map((ev) => (
            <div className="card" key={ev.id}>
              {ev.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="card-image" src={ev.image_url} alt={ev.title} referrerPolicy="no-referrer" />
              ) : (
                <div className="card-image" />
              )}
              <div className="card-body">
                <div className="card-number">
                  {new Date(ev.event_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {ev.location ? ` · ${ev.location}` : ''}
                </div>
                <h3 className="card-title">{ev.title}</h3>
                {ev.description && <div className="card-meta">{ev.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Past Events</h2>
          <div className="grid">
            {past.map((ev) => (
              <div className="card" key={ev.id}>
                {ev.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card-image" src={ev.image_url} alt={ev.title} referrerPolicy="no-referrer" />
                ) : (
                  <div className="card-image" />
                )}
                <div className="card-body">
                  <div className="card-number">
                    {new Date(ev.event_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </div>
                  <h3 className="card-title">{ev.title}</h3>
                  {ev.description && <div className="card-meta">{ev.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

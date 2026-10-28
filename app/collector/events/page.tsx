import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import EventInterestButton from '../../components/EventInterestButton';

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  date_precision: 'exact' | 'month';
  location: string | null;
  image_url: string | null;
  sold_out: boolean;
  catalog_url: string | null;
  address: string | null;
};

function getDateParts(value: string | Date, precision: 'exact' | 'month') {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { day: null as string | null, month: '', year: '' };
  const month = d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const year = String(d.getUTCFullYear());
  if (precision === 'month') {
    return { day: null, month, year };
  }
  const day = String(d.getUTCDate()).padStart(2, '0');
  return { day, month, year };
}

function LocationPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function EventList({ events, interestedIds }: { events: Event[]; interestedIds: Set<number> }) {
  return (
    <div className="event-list">
      {events.map((ev) => {
        const parts = getDateParts(ev.event_date, ev.date_precision);
        return (
          <div className="event-row" key={ev.id}>
            <div className="event-date-block">
              {parts.day && <div className="event-date-day">{parts.day}</div>}
              <div className="event-date-month">{parts.month}</div>
              <div className="event-date-year">{parts.year}</div>
            </div>

            {ev.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="event-row-image" src={ev.image_url} alt={ev.title} referrerPolicy="no-referrer" />
            ) : (
              <div className="event-row-image" />
            )}

            <div className="event-row-body">
              <h3 className="event-row-title">{ev.title}</h3>
              {ev.location && (
                <div className="event-row-location">
                  <LocationPin />
                  {ev.location}
                </div>
              )}
              {ev.address && <div className="event-row-description">{ev.address}</div>}
              {ev.description && <div className="event-row-description">{ev.description}</div>}
              {ev.catalog_url && (
                <div className="event-row-description">
                  <a href={ev.catalog_url} target="_blank" rel="noopener noreferrer">
                    Open catalogue (PDF)
                  </a>
                </div>
              )}
            </div>

            {ev.sold_out ? (
              <div className="event-row-description" style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                Sold out
              </div>
            ) : (
              <EventInterestButton eventId={ev.id} initialInterested={interestedIds.has(ev.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function CollectorEventsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const upcoming = await query<Event>(
    `SELECT id, title, description, event_date, date_precision, location, image_url, sold_out, catalog_url, address
     FROM public.events
     WHERE show_collectors = true AND event_date >= CURRENT_DATE
     ORDER BY event_date ASC`
  );

  const past = await query<Event>(
    `SELECT id, title, description, event_date, date_precision, location, image_url, sold_out, catalog_url, address
     FROM public.events
     WHERE show_collectors = true AND event_date < CURRENT_DATE
     ORDER BY event_date DESC
     LIMIT 6`
  );

  const interestedIds = new Set<number>();
  if (session.contactId) {
    const rows = await query<{ event_id: number }>(
      `SELECT event_id FROM public.event_interests WHERE contact_id = $1`,
      [session.contactId]
    );
    rows.forEach((r) => interestedIds.add(r.event_id));
  }

  return (
    <>
      <Link href="/collector" className="back-link">
        ← Back to My Artworks
      </Link>

      <div className="eyebrow">Events</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Upcoming Events
      </h1>
      <p className="subtitle">
        Exclusive invitations for members of the GLOD Collectors Circle. Let us know if you're interested
        and we'll follow up with more details.
      </p>

      {upcoming.length === 0 ? (
        <div className="empty-state">No upcoming events right now — check back soon.</div>
      ) : (
        <EventList events={upcoming} interestedIds={interestedIds} />
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Past Events</h2>
          <EventList events={past} interestedIds={interestedIds} />
        </>
      )}
    </>
  );
}

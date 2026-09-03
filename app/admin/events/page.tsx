import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession, getSessionDisplayName } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import UserMenu from '../../components/UserMenu';
import AdminNav from '../../components/AdminNav';
import EventComposer from '../../components/EventComposer';
import EventRow from '../../components/EventRow';

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  date_precision: 'exact' | 'month';
  location: string | null;
  image_url: string | null;
  interest_count: number;
};

export default async function AdminEventsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const events = await query<Event>(
    `SELECT e.id, e.title, e.description, e.event_date, e.date_precision, e.location, e.image_url,
            COUNT(ei.id)::int AS interest_count
     FROM public.events e
     LEFT JOIN public.event_interests ei ON ei.event_id = e.id
     GROUP BY e.id
     ORDER BY e.event_date DESC, e.id DESC`
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

      <AdminNav active="events" />

      <div className="eyebrow">Admin</div>
      <h1 className="title">Manage Events</h1>
      <p className="subtitle">Events appear in the collector Events section, sorted by date.</p>

      <EventComposer />

      <h2 className="section-title">All Events</h2>
      {events.length === 0 ? (
        <div className="empty-state">No events yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

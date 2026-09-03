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
  location: string | null;
  image_url: string | null;
};

export default async function AdminEventsPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/collector');

  const events = await query<Event>(
    `SELECT id, title, description, event_date, location, image_url
     FROM public.events
     ORDER BY event_date DESC, id DESC`
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
      <h1 className="title">Events verwalten</h1>
      <p className="subtitle">Events erscheinen im Events-Bereich der Sammler, sortiert nach Datum.</p>

      <EventComposer />

      <h2 className="section-title">Alle Events</h2>
      {events.length === 0 ? (
        <div className="empty-state">Noch keine Events.</div>
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

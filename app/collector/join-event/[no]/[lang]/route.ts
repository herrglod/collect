import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../../lib/auth-server';
import { queryOne } from '../../../../../lib/db';

// "Login as a collector and join event": reached from glod.art/events/<archive no>.
// The middleware sends logged-out visitors to /login?next=<this path>; after the login they land here.
// We register the collector's interest for the event and send them back to glod.art.
const LANGS = ['en', 'de', 'fr', 'es', 'it', 'zh', 'pl', 'ja'];

export async function GET(_req: NextRequest, { params }: { params: { no: string; lang: string } }) {
  const no = String(params.no || '').trim().toUpperCase();
  const lang = LANGS.includes(params.lang) ? params.lang : 'en';
  const prefix = lang === 'en' ? '' : `/${lang}`;
  const back = (status: string) =>
    NextResponse.redirect(
      `https://www.glod.art${prefix}/events/${encodeURIComponent(no)}?status=${status}`
    );

  if (!/^[A-Z][A-Z0-9]{2,11}$/.test(no)) {
    return NextResponse.redirect(`https://www.glod.art${prefix}/events`);
  }

  const session = await getServerSession();
  if (!session || !session.contactId) {
    return back('nocontact');
  }

  const ev = await queryOne<{ id: number; sold_out: boolean; upcoming: boolean }>(
    `SELECT id, sold_out,
            (CASE date_precision
               WHEN 'month' THEN (date_trunc('month', event_date) + interval '1 month')::date
               WHEN 'year' THEN (date_trunc('year', event_date) + interval '1 year')::date
               ELSE COALESCE(end_date, event_date) + 1 END) > current_date AS upcoming
     FROM public.events
     WHERE show_public = true AND upper(archive_no) = $1`,
    [no]
  );
  if (!ev) return back('notfound');
  if (ev.sold_out) return back('soldout');
  if (!ev.upcoming) return back('past');

  await queryOne(
    `INSERT INTO public.event_interests (event_id, contact_id, source)
     VALUES ($1, $2, 'collector-login')
     ON CONFLICT (event_id, contact_id) DO NOTHING`,
    [ev.id, session.contactId]
  );
  return back('joined');
}

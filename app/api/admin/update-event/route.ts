import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const eventId = Number(body?.event_id);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description =
    typeof body?.description === 'string' && body.description.trim().length > 0
      ? body.description.trim()
      : null;
  const location =
    typeof body?.location === 'string' && body.location.trim().length > 0 ? body.location.trim() : null;
  const imageUrl =
    typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;
  const eventDate = typeof body?.event_date === 'string' && body.event_date ? body.event_date : null;

  if (!eventId || !title || !eventDate) {
    return NextResponse.json({ error: 'event_id, Titel und Datum sind erforderlich.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.events
     SET title = $2, description = $3, event_date = $4::date, location = $5, image_url = $6, updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [eventId, title, description, eventDate, location, imageUrl]
  );

  if (!row) {
    return NextResponse.json({ error: 'Event nicht gefunden.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

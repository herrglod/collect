import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';
import { parseEventExtras, isUniqueViolation } from '../../../../lib/events';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
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
  const datePrecision = body?.date_precision === 'month' ? 'month' : 'exact';
  const rawDate = typeof body?.event_date === 'string' ? body.event_date : '';

  if (!eventId || !title || !rawDate) {
    return NextResponse.json({ error: 'event_id, title and date are required.' }, { status: 400 });
  }

  const eventDate = datePrecision === 'month' && /^\d{4}-\d{2}$/.test(rawDate) ? `${rawDate}-01` : rawDate;

  const extras = parseEventExtras(body);
  if (extras.error || !extras.value) {
    return NextResponse.json({ error: extras.error || 'Invalid data.' }, { status: 400 });
  }
  const x = extras.value;

  let row;
  try {
    row = await queryOne(
      `UPDATE public.events
       SET title = $2, description = $3, event_date = $4::date, date_precision = $5,
           location = $6, image_url = $7, archive_no = $8, time_text = $9,
           show_public = $10, show_collectors = $11, sold_out = $12, catalog_url = $13,
           updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [eventId, title, description, eventDate, datePrecision, location, imageUrl,
        x.archiveNo, x.timeText, x.showPublic, x.showCollectors, x.soldOut, x.catalogUrl]
    );
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: 'This archive number is already used by another event.' }, { status: 400 });
    }
    throw err;
  }

  if (!row) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

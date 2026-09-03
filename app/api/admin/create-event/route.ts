import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
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

  if (!title || !rawDate) {
    return NextResponse.json({ error: 'Title and date are required.' }, { status: 400 });
  }

  // Month inputs arrive as "YYYY-MM"; normalize to the 1st of that month for storage.
  const eventDate = datePrecision === 'month' && /^\d{4}-\d{2}$/.test(rawDate) ? `${rawDate}-01` : rawDate;

  await queryOne(
    `INSERT INTO public.events (title, description, event_date, date_precision, location, image_url)
     VALUES ($1, $2, $3::date, $4, $5, $6)
     RETURNING id`,
    [title, description, eventDate, datePrecision, location, imageUrl]
  );

  return NextResponse.json({ ok: true });
}

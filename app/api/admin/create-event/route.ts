import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
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
  const eventDate = typeof body?.event_date === 'string' && body.event_date ? body.event_date : null;

  if (!title || !eventDate) {
    return NextResponse.json({ error: 'Titel und Datum sind erforderlich.' }, { status: 400 });
  }

  await queryOne(
    `INSERT INTO public.events (title, description, event_date, location, image_url)
     VALUES ($1, $2, $3::date, $4, $5)
     RETURNING id`,
    [title, description, eventDate, location, imageUrl]
  );

  return NextResponse.json({ ok: true });
}

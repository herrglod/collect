import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const eventId = Number(body?.event_id);
  if (!eventId) {
    return NextResponse.json({ error: 'event_id is required.' }, { status: 400 });
  }

  const existing = await queryOne(
    `SELECT id FROM public.event_interests WHERE event_id = $1 AND contact_id = $2`,
    [eventId, session.contactId]
  );

  if (existing) {
    await queryOne(`DELETE FROM public.event_interests WHERE event_id = $1 AND contact_id = $2`, [
      eventId,
      session.contactId,
    ]);
    return NextResponse.json({ ok: true, interested: false });
  }

  const ev = await queryOne<{ sold_out: boolean }>(`SELECT sold_out FROM public.events WHERE id = $1`, [eventId]);
  if (!ev) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }
  if (ev.sold_out) {
    return NextResponse.json({ error: 'This event is sold out.' }, { status: 409 });
  }

  await queryOne(
    `INSERT INTO public.event_interests (event_id, contact_id) VALUES ($1, $2)
     ON CONFLICT (event_id, contact_id) DO NOTHING`,
    [eventId, session.contactId]
  );
  return NextResponse.json({ ok: true, interested: true });
}

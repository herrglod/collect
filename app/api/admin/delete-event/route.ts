import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const eventId = Number(body?.event_id);
  if (!eventId) {
    return NextResponse.json({ error: 'event_id is required.' }, { status: 400 });
  }

  await queryOne(`DELETE FROM public.events WHERE id = $1 RETURNING id`, [eventId]);

  return NextResponse.json({ ok: true });
}

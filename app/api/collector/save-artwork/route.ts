import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number : '';
  if (!archiveNumber) {
    return NextResponse.json({ error: 'archive_number is required.' }, { status: 400 });
  }

  const existing = await queryOne(
    `SELECT id FROM public.artwork_saves WHERE archive_number = $1 AND contact_id = $2`,
    [archiveNumber, session.contactId]
  );

  if (existing) {
    await queryOne(`DELETE FROM public.artwork_saves WHERE archive_number = $1 AND contact_id = $2`, [
      archiveNumber,
      session.contactId,
    ]);
    return NextResponse.json({ ok: true, saved: false });
  }

  await queryOne(
    `INSERT INTO public.artwork_saves (archive_number, contact_id) VALUES ($1, $2)
     ON CONFLICT (archive_number, contact_id) DO NOTHING`,
    [archiveNumber, session.contactId]
  );
  return NextResponse.json({ ok: true, saved: true });
}

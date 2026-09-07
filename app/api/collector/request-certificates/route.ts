import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { getServerSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumbers: string[] = Array.isArray(body?.archive_numbers)
    ? body.archive_numbers.filter((v: unknown) => typeof v === 'string')
    : [];

  if (archiveNumbers.length === 0) {
    return NextResponse.json({ error: 'Please select at least one artwork.' }, { status: 400 });
  }

  // Only allow requesting for artworks the collector actually owns (active ownership).
  const owned = await query<{ archive_number: string }>(
    `SELECT archive_number FROM public.ownerships
     WHERE contact_id = $1 AND transferred_at IS NULL AND archive_number = ANY($2::text[])`,
    [session.contactId, archiveNumbers]
  );
  const ownedSet = new Set(owned.map((o) => o.archive_number));
  const validNumbers = archiveNumbers.filter((a) => ownedSet.has(a));

  if (validNumbers.length === 0) {
    return NextResponse.json({ error: 'None of the selected artworks are in your collection.' }, { status: 400 });
  }

  for (const archiveNumber of validNumbers) {
    const existing = await query(
      `SELECT id FROM public.certificate_requests
       WHERE contact_id = $1 AND archive_number = $2 AND status IN ('pending','contacted')`,
      [session.contactId, archiveNumber]
    );
    if (existing.length === 0) {
      await query(
        `INSERT INTO public.certificate_requests (contact_id, archive_number) VALUES ($1, $2)`,
        [session.contactId, archiveNumber]
      );
    }
  }

  return NextResponse.json({ ok: true, count: validNumbers.length });
}

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { getServerSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim().toUpperCase() : '';
  const editionNumber = typeof body?.edition_number === 'string' ? body.edition_number.trim() : '';

  if (!archiveNumber || !editionNumber) {
    return NextResponse.json({ error: 'archive_number and edition_number are required.' }, { status: 400 });
  }

  // Confirm this artwork is actually owned by the requesting collector.
  const ownership = await queryOne<{ id: number }>(
    `SELECT o.id FROM public.ownerships o
     WHERE o.contact_id = $1 AND o.archive_number = $2 AND o.transferred_at IS NULL`,
    [session.contactId, archiveNumber]
  );
  if (!ownership) {
    return NextResponse.json({ error: 'This artwork is not linked to your account.' }, { status: 404 });
  }

  const artwork = await queryOne<{ name: string }>(
    `SELECT name FROM public.artworks WHERE archive_number = $1`,
    [archiveNumber]
  );

  const description = `Edition number self-report for ${archiveNumber}${
    artwork ? ` ("${artwork.name}")` : ''
  }: the collector states their edition number is "${editionNumber}". Please verify and set it via Active Assignments.`;

  await query(
    `INSERT INTO public.connect_requests (contact_id, description, status, artwork_type)
     VALUES ($1, $2, 'pending', 'limited_edition')`,
    [session.contactId, description]
  );

  return NextResponse.json({ ok: true });
}

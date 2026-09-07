import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contactId = Number(body?.contact_id);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim().toUpperCase() : '';
  const notes = typeof body?.notes === 'string' && body.notes.trim().length > 0 ? body.notes.trim() : null;

  // Accept either a single `edition_number`, or an `edition_numbers` array for
  // assigning several copies of the same edition (e.g. multiple prints delivered
  // to a gallery partner at once) in one request.
  let editionNumbers: (string | null)[];
  if (Array.isArray(body?.edition_numbers)) {
    const cleaned = (body.edition_numbers as unknown[])
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter((v) => v.length > 0);
    editionNumbers = cleaned.length > 0 ? cleaned : [null];
  } else {
    const editionNumberRaw = typeof body?.edition_number === 'string' ? body.edition_number.trim() : '';
    editionNumbers = [editionNumberRaw.length > 0 ? editionNumberRaw : null];
  }

  if (!contactId || !archiveNumber) {
    return NextResponse.json({ error: 'contact_id and archive_number are required.' }, { status: 400 });
  }

  const contact = await queryOne(`SELECT id FROM public.contacts WHERE id = $1`, [contactId]);
  if (!contact) {
    return NextResponse.json({ error: `Contact with ID ${contactId} not found.` }, { status: 404 });
  }

  const artwork = await queryOne<{ archive_number: string; name: string }>(
    `SELECT archive_number, name FROM public.artworks WHERE archive_number = $1`,
    [archiveNumber]
  );
  if (!artwork) {
    return NextResponse.json({ error: `Artwork with archive number ${archiveNumber} not found.` }, { status: 404 });
  }

  const assigned: any[] = [];
  const errors: string[] = [];

  for (const editionNumber of editionNumbers) {
    try {
      const [row] = await query(
        `INSERT INTO public.ownerships (contact_id, archive_number, edition_number, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id, contact_id, archive_number, edition_number, acquired_at`,
        [contactId, archiveNumber, editionNumber, notes]
      );
      assigned.push(row);
    } catch (err: any) {
      if (err?.code === '23505') {
        errors.push(`Edition ${archiveNumber}${editionNumber ? ` / ${editionNumber}` : ''} is already assigned to an active owner.`);
      } else {
        errors.push(`Unexpected error assigning ${archiveNumber}${editionNumber ? ` / ${editionNumber}` : ''}.`);
      }
    }
  }

  if (assigned.length === 0) {
    return NextResponse.json({ error: errors.join(' ') || 'Unexpected error while assigning.' }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    ownership: assigned[0],
    ownerships: assigned,
    assignedCount: assigned.length,
    errors: errors.length > 0 ? errors : undefined,
    artwork_name: artwork.name,
  });
}

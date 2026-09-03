import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contactId = Number(body?.contact_id);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim().toUpperCase() : '';
  const editionNumberRaw = typeof body?.edition_number === 'string' ? body.edition_number.trim() : '';
  const editionNumber = editionNumberRaw.length > 0 ? editionNumberRaw : null;
  const notes = typeof body?.notes === 'string' && body.notes.trim().length > 0 ? body.notes.trim() : null;

  if (!contactId || !archiveNumber) {
    return NextResponse.json({ error: 'contact_id und archive_number sind erforderlich.' }, { status: 400 });
  }

  const contact = await queryOne(`SELECT id FROM public.contacts WHERE id = $1`, [contactId]);
  if (!contact) {
    return NextResponse.json({ error: `Kontakt mit ID ${contactId} nicht gefunden.` }, { status: 404 });
  }

  const artwork = await queryOne<{ archive_number: string; name: string }>(
    `SELECT archive_number, name FROM public.artworks WHERE archive_number = $1`,
    [archiveNumber]
  );
  if (!artwork) {
    return NextResponse.json({ error: `Kunstwerk mit Archive Number ${archiveNumber} nicht gefunden.` }, { status: 404 });
  }

  try {
    const [row] = await query(
      `INSERT INTO public.ownerships (contact_id, archive_number, edition_number, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, contact_id, archive_number, edition_number, acquired_at`,
      [contactId, archiveNumber, editionNumber, notes]
    );
    return NextResponse.json({ ok: true, ownership: row, artwork_name: artwork.name });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json(
        { error: `Diese Edition (${archiveNumber} / ${editionNumber}) ist bereits einem aktiven Besitzer zugeordnet.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Unerwarteter Fehler beim Zuordnen.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ownershipId = Number(body?.ownership_id);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim().toUpperCase() : '';
  const editionNumberRaw = typeof body?.edition_number === 'string' ? body.edition_number.trim() : '';
  const editionNumber = editionNumberRaw.length > 0 ? editionNumberRaw : null;

  if (!ownershipId || !archiveNumber) {
    return NextResponse.json({ error: 'ownership_id und archive_number sind erforderlich.' }, { status: 400 });
  }

  const artwork = await queryOne<{ archive_number: string }>(
    `SELECT archive_number FROM public.artworks WHERE archive_number = $1`,
    [archiveNumber]
  );
  if (!artwork) {
    return NextResponse.json({ error: `Kunstwerk mit Archive Number ${archiveNumber} nicht gefunden.` }, { status: 404 });
  }

  try {
    const row = await queryOne(
      `UPDATE public.ownerships
       SET archive_number = $2, edition_number = $3, updated_at = now()
       WHERE id = $1 AND transferred_at IS NULL
       RETURNING id`,
      [ownershipId, archiveNumber, editionNumber]
    );
    if (!row) {
      return NextResponse.json({ error: 'Zuordnung nicht gefunden oder bereits beendet.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json(
        { error: `Diese Edition (${archiveNumber} / ${editionNumber}) ist bereits einem aktiven Besitzer zugeordnet.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Unerwarteter Fehler beim Speichern.' }, { status: 500 });
  }
}

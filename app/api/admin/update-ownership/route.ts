import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ownershipId = Number(body?.ownership_id);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim().toUpperCase() : '';
  const editionNumberRaw = typeof body?.edition_number === 'string' ? body.edition_number.trim() : '';
  const editionNumber = editionNumberRaw.length > 0 ? editionNumberRaw : null;
  const acquiredAtRaw = typeof body?.acquired_at === 'string' ? body.acquired_at.trim() : '';
  const acquiredAt = acquiredAtRaw.length > 0 ? acquiredAtRaw : null;

  if (!ownershipId || !archiveNumber) {
    return NextResponse.json({ error: 'ownership_id and archive_number are required.' }, { status: 400 });
  }
  if (acquiredAt && Number.isNaN(Date.parse(acquiredAt))) {
    return NextResponse.json({ error: 'Invalid acquired_at date.' }, { status: 400 });
  }

  const artwork = await queryOne<{ archive_number: string }>(
    `SELECT archive_number FROM public.artworks WHERE archive_number = $1`,
    [archiveNumber]
  );
  if (!artwork) {
    return NextResponse.json({ error: `Artwork with archive number ${archiveNumber} not found.` }, { status: 404 });
  }

  try {
    const row = await queryOne(
      `UPDATE public.ownerships
       SET archive_number = $2, edition_number = $3,
           acquired_at = COALESCE($4::date, acquired_at), updated_at = now()
       WHERE id = $1 AND transferred_at IS NULL
       RETURNING id`,
      [ownershipId, archiveNumber, editionNumber, acquiredAt]
    );
    if (!row) {
      return NextResponse.json({ error: 'Assignment not found or already ended.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json(
        { error: `This edition (${archiveNumber} / ${editionNumber}) is already assigned to an active owner.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Unexpected error while saving.' }, { status: 500 });
  }
}

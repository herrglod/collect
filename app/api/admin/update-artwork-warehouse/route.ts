import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number : '';
  const warehouseIdRaw = body?.warehouse_id;
  const warehouseId =
    warehouseIdRaw === null || warehouseIdRaw === '' || warehouseIdRaw === undefined
      ? null
      : Number(warehouseIdRaw);

  if (!archiveNumber) {
    return NextResponse.json({ error: 'Invalid data.' }, { status: 400 });
  }
  if (warehouseId !== null && (Number.isNaN(warehouseId) || warehouseId <= 0)) {
    return NextResponse.json({ error: 'Invalid warehouse.' }, { status: 400 });
  }

  const owned = await queryOne(
    `SELECT id FROM public.ownerships WHERE archive_number = $1 AND transferred_at IS NULL`,
    [archiveNumber]
  );
  if (owned) {
    return NextResponse.json(
      { error: 'This artwork is already assigned to a collector and counts as sold — it cannot be stored in a warehouse.' },
      { status: 409 }
    );
  }

  const row = await queryOne(
    `UPDATE public.artworks SET warehouse_id = $2, updated_at = now() WHERE archive_number = $1 RETURNING archive_number`,
    [archiveNumber, warehouseId]
  );

  if (!row) {
    return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  // Bulk-assign multiple artworks to a warehouse in one call.
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumbers = Array.isArray(body?.archive_numbers)
    ? body.archive_numbers.filter((v: unknown) => typeof v === 'string' && v.length > 0)
    : [];
  const warehouseIdRaw = body?.warehouse_id;
  const warehouseId =
    warehouseIdRaw === null || warehouseIdRaw === '' || warehouseIdRaw === undefined
      ? null
      : Number(warehouseIdRaw);

  if (archiveNumbers.length === 0) {
    return NextResponse.json({ error: 'No artworks selected.' }, { status: 400 });
  }
  if (warehouseId !== null && (Number.isNaN(warehouseId) || warehouseId <= 0)) {
    return NextResponse.json({ error: 'Invalid warehouse.' }, { status: 400 });
  }

  const updated = await query<{ archive_number: string }>(
    `UPDATE public.artworks a
     SET warehouse_id = $2, updated_at = now()
     WHERE a.archive_number = ANY($1::text[])
       AND NOT EXISTS (
         SELECT 1 FROM public.ownerships o
         WHERE o.archive_number = a.archive_number AND o.transferred_at IS NULL
       )
     RETURNING a.archive_number`,
    [archiveNumbers, warehouseId]
  );

  const skipped = archiveNumbers.length - updated.length;

  return NextResponse.json({ ok: true, updated: updated.length, skipped });
}

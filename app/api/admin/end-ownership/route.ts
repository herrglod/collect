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
  if (!ownershipId) {
    return NextResponse.json({ error: 'ownership_id is required.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.ownerships
     SET transferred_at = CURRENT_DATE, updated_at = now()
     WHERE id = $1 AND transferred_at IS NULL
     RETURNING id`,
    [ownershipId]
  );

  if (!row) {
    return NextResponse.json({ error: 'Assignment not found or already ended.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

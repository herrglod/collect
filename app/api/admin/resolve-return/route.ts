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
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.ownerships SET status = 'owned' WHERE id = $1 AND status = 'retour_requested' RETURNING id`,
    [ownershipId]
  );
  if (!row) {
    return NextResponse.json({ error: 'Return request not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

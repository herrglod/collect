import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const requestId = Number(body?.request_id);
  const status = typeof body?.status === 'string' ? body.status : '';

  if (!requestId || !['pending', 'contacted', 'completed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.certificate_requests SET status = $2 WHERE id = $1 RETURNING id`,
    [requestId, status]
  );
  if (!row) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

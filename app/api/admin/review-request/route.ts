import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const requestId = Number(body?.request_id);
  const status = body?.status;

  if (!requestId || (status !== 'approved' && status !== 'rejected')) {
    return NextResponse.json({ error: 'request_id and a valid status are required.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.connect_requests
     SET status = $2, reviewed_at = now()
     WHERE id = $1
     RETURNING id`,
    [requestId, status]
  );

  if (!row) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

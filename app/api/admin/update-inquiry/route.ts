import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

const VALID_STATUSES = ['pending', 'contacted', 'completed', 'cancelled'];

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const inquiryId = Number(body?.inquiry_id);
  const status = body?.status;

  if (!inquiryId || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid data.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.purchase_inquiries SET status = $2 WHERE id = $1 RETURNING id`,
    [inquiryId, status]
  );

  if (!row) {
    return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

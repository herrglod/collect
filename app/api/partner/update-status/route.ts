import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { getServerSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId || (session.role !== 'gallery_partner' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ownershipId = Number(body?.ownership_id);
  const status = typeof body?.status === 'string' ? body.status : '';

  if (!ownershipId || !['exhibited', 'stored', 'sold'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const ownership = await queryOne<{ id: number; contact_id: number }>(
    `SELECT id, contact_id FROM public.ownerships WHERE id = $1 AND transferred_at IS NULL`,
    [ownershipId]
  );
  if (!ownership || ownership.contact_id !== session.contactId) {
    return NextResponse.json({ error: 'Artwork not found in your inventory.' }, { status: 404 });
  }

  await queryOne(`UPDATE public.ownerships SET status = $2, updated_at = now() WHERE id = $1`, [
    ownershipId,
    status,
  ]);

  return NextResponse.json({ ok: true });
}

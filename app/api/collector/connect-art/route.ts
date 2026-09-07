import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const artworkType =
    typeof body?.artwork_type === 'string' && body.artwork_type.trim().length > 0
      ? body.artwork_type.trim()
      : null;
  const purchasedFrom =
    typeof body?.purchased_from === 'string' && body.purchased_from.trim().length > 0
      ? body.purchased_from.trim()
      : null;

  if (!description) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
  }

  try {
    await queryOne(
      `INSERT INTO public.connect_requests (contact_id, description, artwork_type, purchased_from)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [session.contactId, description, artworkType, purchasedFrom]
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err?.message || 'unknown'}` }, { status: 500 });
  }
}

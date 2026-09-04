import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

const VALID_AUDIENCES = ['collectors', 'gallery', 'both'];

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number : '';
  const audience = typeof body?.for_sale_audience === 'string' ? body.for_sale_audience : '';
  const pricePartnerRaw = body?.price_partner;
  const pricePartner =
    typeof pricePartnerRaw === 'string' && pricePartnerRaw.trim().length > 0
      ? Number(pricePartnerRaw.trim())
      : null;

  if (!archiveNumber || !VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json({ error: 'Invalid data.' }, { status: 400 });
  }
  if (pricePartner !== null && (Number.isNaN(pricePartner) || pricePartner < 0)) {
    return NextResponse.json({ error: 'Invalid partner price.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.artworks
     SET for_sale_audience = $2, price_partner = $3, updated_at = now()
     WHERE archive_number = $1
     RETURNING archive_number`,
    [archiveNumber, audience, pricePartner]
  );

  if (!row) {
    return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

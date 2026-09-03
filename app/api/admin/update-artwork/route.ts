import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

const VALID_CATEGORIES = ['artwork', 'objects', 'fashion'];
const VALID_EDITION_TYPES = ['unique', 'limited_edition'];

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number : '';
  const category = typeof body?.category === 'string' ? body.category : '';
  const editionType = typeof body?.edition_type === 'string' ? body.edition_type : '';
  const forSale = Boolean(body?.for_sale);
  const priceRaw = body?.price_public;
  const price =
    typeof priceRaw === 'string' && priceRaw.trim().length > 0 ? Number(priceRaw.trim()) : null;

  if (!archiveNumber || !VALID_CATEGORIES.includes(category) || !VALID_EDITION_TYPES.includes(editionType)) {
    return NextResponse.json({ error: 'Invalid data.' }, { status: 400 });
  }
  if (price !== null && (Number.isNaN(price) || price < 0)) {
    return NextResponse.json({ error: 'Invalid price.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.artworks
     SET category = $2, edition_type = $3, for_sale = $4, price_public = $5, updated_at = now()
     WHERE archive_number = $1
     RETURNING archive_number`,
    [archiveNumber, category, editionType, forSale, price]
  );

  if (!row) {
    return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

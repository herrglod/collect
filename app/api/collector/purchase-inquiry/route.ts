import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const archiveNumber = typeof body?.archive_number === 'string' ? body.archive_number.trim() : '';
  const fulfillment = body?.fulfillment === 'shipping' ? 'shipping' : body?.fulfillment === 'pickup' ? 'pickup' : '';
  const shippingCity =
    typeof body?.shipping_city === 'string' && body.shipping_city.trim().length > 0 ? body.shipping_city.trim() : null;
  const shippingCountry =
    typeof body?.shipping_country === 'string' && body.shipping_country.trim().length > 0
      ? body.shipping_country.trim()
      : null;
  const contactMethod = body?.contact_method === 'whatsapp' ? 'whatsapp' : body?.contact_method === 'email' ? 'email' : '';
  const contactValue = typeof body?.contact_value === 'string' ? body.contact_value.trim() : '';
  const message = typeof body?.message === 'string' && body.message.trim().length > 0 ? body.message.trim() : null;

  if (!archiveNumber || !fulfillment || !contactMethod || !contactValue) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (fulfillment === 'shipping' && (!shippingCity || !shippingCountry)) {
    return NextResponse.json({ error: 'City and country are required for shipping.' }, { status: 400 });
  }

  const artwork = await queryOne(`SELECT archive_number FROM public.artworks WHERE archive_number = $1`, [
    archiveNumber,
  ]);
  if (!artwork) {
    return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
  }

  await queryOne(
    `INSERT INTO public.purchase_inquiries
       (contact_id, archive_number, fulfillment, shipping_city, shipping_country, contact_method, contact_value, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [session.contactId, archiveNumber, fulfillment, shippingCity, shippingCountry, contactMethod, contactValue, message]
  );

  return NextResponse.json({ ok: true });
}

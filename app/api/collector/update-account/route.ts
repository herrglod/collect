import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' && body.email.trim().length > 0 ? body.email.trim() : null;
  const phone = typeof body?.phone === 'string' && body.phone.trim().length > 0 ? body.phone.trim() : null;
  const instagram =
    typeof body?.instagram === 'string' && body.instagram.trim().length > 0 ? body.instagram.trim() : null;
  const city = typeof body?.city === 'string' && body.city.trim().length > 0 ? body.city.trim() : null;
  const country = typeof body?.country === 'string' && body.country.trim().length > 0 ? body.country.trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  try {
    await queryOne(
      `UPDATE public.contacts
       SET name = $2, email = $3, phone = $4, instagram = $5, city = $6, country = $7, updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [session.contactId, name, email, phone, instagram, city, country]
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err?.message || 'unknown'}` }, { status: 500 });
  }
}

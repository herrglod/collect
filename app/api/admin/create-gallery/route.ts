import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' && body.email.trim().length > 0 ? body.email.trim() : null;
  const city = typeof body?.city === 'string' && body.city.trim().length > 0 ? body.city.trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Name der Gallery ist erforderlich.' }, { status: 400 });
  }

  const contact = await queryOne<{ id: number; name: string }>(
    `INSERT INTO public.contacts (name, type, email, city)
     VALUES ($1, 'gallery', $2, $3)
     RETURNING id, name`,
    [name, email, city]
  );

  return NextResponse.json({ ok: true, contact });
}

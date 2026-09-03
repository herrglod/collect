import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';
import { generateTempPassword, hashPassword } from '../../../../lib/password';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contactId = Number(body?.contact_id);
  const overrideEmail =
    typeof body?.email === 'string' && body.email.trim().length > 0 ? body.email.trim().toLowerCase() : null;

  if (!contactId) {
    return NextResponse.json({ error: 'Ungültiger Kontakt.' }, { status: 400 });
  }

  const contact = await queryOne<{ id: number; name: string; email: string | null }>(
    `SELECT id, name, email FROM public.contacts WHERE id = $1`,
    [contactId]
  );
  if (!contact) {
    return NextResponse.json({ error: 'Kontakt nicht gefunden.' }, { status: 404 });
  }

  const existing = await queryOne(`SELECT id FROM public.platform_users WHERE contact_id = $1`, [contactId]);
  if (existing) {
    return NextResponse.json(
      { error: 'Dieser Kontakt hat bereits einen Zugang. Bitte stattdessen Passwort zurücksetzen.' },
      { status: 400 }
    );
  }

  const loginEmail = overrideEmail || (contact.email ? contact.email.toLowerCase() : null);
  if (!loginEmail) {
    return NextResponse.json(
      { error: 'Für diesen Kontakt ist keine Email hinterlegt. Bitte Email angeben.' },
      { status: 400 }
    );
  }

  const emailTaken = await queryOne(`SELECT id FROM public.platform_users WHERE lower(email) = $1`, [loginEmail]);
  if (emailTaken) {
    return NextResponse.json({ error: 'Diese Email wird bereits für einen Zugang genutzt.' }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await queryOne(
    `INSERT INTO public.platform_users (contact_id, email, password_hash, role)
     VALUES ($1, $2, $3, 'collector')
     RETURNING id`,
    [contactId, loginEmail, passwordHash]
  );

  return NextResponse.json({ ok: true, email: loginEmail, tempPassword });
}

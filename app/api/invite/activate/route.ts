import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/password';
import { signSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '../../../../lib/session';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!token || !email || !password) {
    return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const invite = await queryOne<{
    id: number;
    contact_id: number;
    expires_at: string;
    accepted_at: string | null;
    contact_name: string;
  }>(
    `SELECT i.id, i.contact_id, i.expires_at, i.accepted_at, c.name AS contact_name
     FROM public.collector_invites i
     JOIN public.contacts c ON c.id = i.contact_id
     WHERE i.token = $1`,
    [token]
  );

  if (!invite) {
    return NextResponse.json({ error: 'This invite link is invalid.' }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'This invite has already been used. Please sign in instead.' }, { status: 400 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invite link has expired. Please ask GLOD for a new one.' }, { status: 400 });
  }

  const existingAccount = await queryOne(`SELECT id FROM public.platform_users WHERE contact_id = $1`, [
    invite.contact_id,
  ]);
  if (existingAccount) {
    return NextResponse.json(
      { error: 'An account already exists for this collector. Please sign in instead.' },
      { status: 400 }
    );
  }

  const emailTaken = await queryOne(`SELECT id FROM public.platform_users WHERE lower(email) = $1`, [email]);
  if (emailTaken) {
    return NextResponse.json({ error: 'This email is already in use for another account.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await queryOne<{ id: number }>(
    `INSERT INTO public.platform_users (contact_id, email, password_hash, role)
     VALUES ($1, $2, $3, 'collector')
     RETURNING id`,
    [invite.contact_id, email, passwordHash]
  );

  await queryOne(`UPDATE public.collector_invites SET accepted_at = now(), email = $2 WHERE id = $1`, [
    invite.id,
    email,
  ]);

  // Backfill the contact's email if it was empty, without overwriting an existing one.
  await queryOne(`UPDATE public.contacts SET email = COALESCE(email, $2) WHERE id = $1`, [
    invite.contact_id,
    email,
  ]);

  // Fire-and-forget welcome email; never block activation on it.
  try {
    await sendWelcomeEmail(email, invite.contact_name);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }

  const sessionToken = await signSession({
    userId: user!.id,
    email,
    role: 'collector',
    contactId: invite.contact_id,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

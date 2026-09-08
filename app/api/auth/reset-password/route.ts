import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/password';
import { signSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '../../../../lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!token || !password) {
    return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const reset = await queryOne<{
    id: number;
    user_id: number;
    expires_at: string;
    used_at: string | null;
  }>(
    `SELECT id, user_id, expires_at, used_at FROM public.password_resets WHERE token = $1`,
    [token]
  );

  if (!reset) {
    return NextResponse.json({ error: 'This reset link is invalid.' }, { status: 404 });
  }
  if (reset.used_at) {
    return NextResponse.json({ error: 'This reset link has already been used. Please request a new one.' }, { status: 400 });
  }
  if (new Date(reset.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
  }

  const user = await queryOne<{ id: number; email: string; role: 'admin' | 'collector' | 'gallery_partner'; contact_id: number | null }>(
    `SELECT id, email, role, contact_id FROM public.platform_users WHERE id = $1`,
    [reset.user_id]
  );
  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);

  await query(`UPDATE public.platform_users SET password_hash = $2 WHERE id = $1`, [user.id, passwordHash]);
  await query(`UPDATE public.password_resets SET used_at = now() WHERE id = $1`, [reset.id]);
  // Any other still-pending reset links for this user become invalid once one is used.
  await query(`DELETE FROM public.password_resets WHERE user_id = $1 AND used_at IS NULL`, [user.id]);

  const sessionToken = await signSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    contactId: user.contact_id,
  });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

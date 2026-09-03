import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '../../../lib/db';
import { signSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '../../../lib/session';

type PlatformUser = {
  id: number;
  contact_id: number | null;
  email: string;
  password_hash: string;
  role: 'admin' | 'collector';
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort erforderlich.' }, { status: 400 });
    }

    const user = await queryOne<PlatformUser>(
      `SELECT id, contact_id, email, password_hash, role
       FROM public.platform_users
       WHERE lower(email) = $1
       LIMIT 1`,
      [email]
    );

    if (!user) {
      return NextResponse.json({ error: 'Ungültige Zugangsdaten.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Ungültige Zugangsdaten.' }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      contactId: user.contact_id,
    });

    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: `Serverfehler: ${err?.message || 'unbekannt'}` },
      { status: 500 }
    );
  }
}

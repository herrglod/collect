import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';
import { hashPassword } from '../../../../lib/password';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Please fill in both fields.' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const user = await queryOne<{ id: number; password_hash: string }>(
    `SELECT id, password_hash FROM public.platform_users WHERE id = $1`,
    [session.userId]
  );
  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await queryOne(`UPDATE public.platform_users SET password_hash = $2 WHERE id = $1`, [user.id, newHash]);

  return NextResponse.json({ ok: true });
}

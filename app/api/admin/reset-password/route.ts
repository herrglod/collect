import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';
import { generateTempPassword, hashPassword } from '../../../../lib/password';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const platformUserId = Number(body?.platform_user_id);
  if (!platformUserId) {
    return NextResponse.json({ error: 'Invalid account.' }, { status: 400 });
  }

  const user = await queryOne<{ id: number; email: string }>(
    `SELECT id, email FROM public.platform_users WHERE id = $1`,
    [platformUserId]
  );
  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await queryOne(`UPDATE public.platform_users SET password_hash = $2 WHERE id = $1`, [
    platformUserId,
    passwordHash,
  ]);

  return NextResponse.json({ ok: true, email: user.email, tempPassword });
}

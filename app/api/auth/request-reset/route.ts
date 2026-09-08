import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query, queryOne } from '../../../../lib/db';
import { sendPasswordResetEmail } from '../../../../lib/email';
import { SITE_URL } from '../../../../lib/site';

const RESET_TTL_HOURS = 1;

// Always returns the same generic response regardless of whether the email is known,
// so this endpoint can't be used to check which addresses have an account.
const GENERIC_RESPONSE = NextResponse.json({
  ok: true,
  message: "If an account exists for that email, we've sent a password reset link.",
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email) {
    return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 });
  }

  const user = await queryOne<{ id: number; email: string }>(
    `SELECT id, email FROM public.platform_users WHERE lower(email) = $1`,
    [email]
  );

  if (!user) {
    // Don't reveal whether the account exists.
    return GENERIC_RESPONSE;
  }

  // Invalidate any previous, unused reset links for this user so only the latest one works.
  await query(`DELETE FROM public.password_resets WHERE user_id = $1 AND used_at IS NULL`, [user.id]);

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000).toISOString();

  await query(
    `INSERT INTO public.password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [user.id, token, expiresAt]
  );

  try {
    await sendPasswordResetEmail(user.email, `${SITE_URL}/reset-password/${token}`);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }

  return GENERIC_RESPONSE;
}

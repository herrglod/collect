import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : 'Test Collector';

  if (!email) {
    return NextResponse.json({ error: 'Please provide an email address.' }, { status: 400 });
  }

  const result = await sendWelcomeEmail(email, name);
  if (!result.sent) {
    return NextResponse.json({ error: result.reason || 'Failed to send.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

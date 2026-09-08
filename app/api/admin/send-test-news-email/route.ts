import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { sendNewsNotification } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const title = typeof body?.title === 'string' && body.title.trim().length > 0 ? body.title.trim() : null;
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const imageUrl =
    typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;

  if (!email) {
    return NextResponse.json({ error: 'Please provide an email address.' }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: 'Please write some post text first.' }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json(
      { error: 'Resend is not configured yet (RESEND_API_KEY / RESEND_FROM_EMAIL are missing in Vercel).' },
      { status: 400 }
    );
  }

  await sendNewsNotification({ title, content, image_url: imageUrl }, [email]);

  return NextResponse.json({ ok: true });
}

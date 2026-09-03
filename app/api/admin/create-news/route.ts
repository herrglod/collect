import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { query, queryOne } from '../../../../lib/db';
import { sendNewsNotification } from '../../../../lib/email';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === 'string' && body.title.trim().length > 0 ? body.title.trim() : null;
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const imageUrl =
    typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;
  const postedAt = typeof body?.posted_at === 'string' && body.posted_at ? body.posted_at : null;

  if (!content) {
    return NextResponse.json({ error: 'Text ist erforderlich.' }, { status: 400 });
  }

  await queryOne(
    `INSERT INTO public.news_posts (title, content, image_url, posted_at)
     VALUES ($1, $2, $3, COALESCE($4::date, now()))
     RETURNING id`,
    [title, content, imageUrl, postedAt]
  );

  // Fire-and-forget: notify collectors who opted into news emails.
  // Never let an email failure affect the news post response.
  try {
    const subscribers = await query<{ email: string }>(
      `SELECT email FROM public.contacts WHERE pref_news_email = true AND email IS NOT NULL AND email <> ''`
    );
    const emails = subscribers.map((s) => s.email);
    if (emails.length > 0) {
      await sendNewsNotification({ title, content, image_url: imageUrl }, emails);
    }
  } catch (err) {
    console.error('Failed to send news notification emails:', err);
  }

  return NextResponse.json({ ok: true });
}

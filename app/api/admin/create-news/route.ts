import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const imageUrl = typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;

  if (!content) {
    return NextResponse.json({ error: 'Text ist erforderlich.' }, { status: 400 });
  }

  await queryOne(
    `INSERT INTO public.news_posts (content, image_url) VALUES ($1, $2) RETURNING id`,
    [content, imageUrl]
  );

  return NextResponse.json({ ok: true });
}

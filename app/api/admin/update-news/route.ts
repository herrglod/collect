import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const postId = Number(body?.post_id);
  const title = typeof body?.title === 'string' && body.title.trim().length > 0 ? body.title.trim() : null;
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const imageUrl =
    typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;
  const postedAt = typeof body?.posted_at === 'string' && body.posted_at ? body.posted_at : null;

  if (!postId || !content) {
    return NextResponse.json({ error: 'post_id und Text sind erforderlich.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.news_posts
     SET title = $2, content = $3, image_url = $4, posted_at = COALESCE($5::date, posted_at)
     WHERE id = $1
     RETURNING id`,
    [postId, title, content, imageUrl, postedAt]
  );

  if (!row) {
    return NextResponse.json({ error: 'Beitrag nicht gefunden.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const postId = Number(body?.post_id);
  const title = typeof body?.title === 'string' && body.title.trim().length > 0 ? body.title.trim() : null;
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  const imageUrl =
    typeof body?.image_url === 'string' && body.image_url.trim().length > 0 ? body.image_url.trim() : null;
  const postedAt = typeof body?.posted_at === 'string' && body.posted_at ? body.posted_at : null;
  const category =
    typeof body?.category === 'string' && body.category.trim().length > 0 ? body.category.trim() : null;
  const sourceUrl =
    typeof body?.source_url === 'string' && body.source_url.trim().length > 0 ? body.source_url.trim() : null;
  const visibleCollectors = body?.visible_collectors !== false;
  const visiblePartners = body?.visible_partners === true;

  if (!postId || !content) {
    return NextResponse.json({ error: 'post_id and text are required.' }, { status: 400 });
  }

  const row = await queryOne(
    `UPDATE public.news_posts
     SET title = $2, content = $3, image_url = $4, posted_at = COALESCE($5::date, posted_at),
         category = $6, source_url = $7, visible_collectors = $8, visible_partners = $9
     WHERE id = $1
     RETURNING id`,
    [postId, title, content, imageUrl, postedAt, category, sourceUrl, visibleCollectors, visiblePartners]
  );

  if (!row) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

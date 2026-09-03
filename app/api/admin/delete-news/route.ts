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
  if (!postId) {
    return NextResponse.json({ error: 'post_id ist erforderlich.' }, { status: 400 });
  }

  await queryOne(`DELETE FROM public.news_posts WHERE id = $1 RETURNING id`, [postId]);

  return NextResponse.json({ ok: true });
}

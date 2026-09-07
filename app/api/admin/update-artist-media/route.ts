import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const links: { key: string; url: string | null }[] = Array.isArray(body?.links) ? body.links : [];
  const photoUrl =
    typeof body?.photo_url === 'string' && body.photo_url.trim().length > 0 ? body.photo_url.trim() : null;
  const bioShort =
    typeof body?.bio_short === 'string' && body.bio_short.trim().length > 0 ? body.bio_short.trim() : null;

  for (const link of links) {
    if (typeof link.key !== 'string') continue;
    const url = typeof link.url === 'string' && link.url.trim().length > 0 ? link.url.trim() : null;
    await query(`UPDATE public.artist_media_links SET url = $2, updated_at = now() WHERE key = $1`, [
      link.key,
      url,
    ]);
  }

  if (body?.profile) {
    await queryOne(
      `UPDATE public.artist_media_profile SET photo_url = $1, bio_short = $2, updated_at = now() WHERE id = 1`,
      [photoUrl, bioShort]
    );
  }

  return NextResponse.json({ ok: true });
}

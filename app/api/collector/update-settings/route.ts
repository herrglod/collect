import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.contactId) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const prefEmail = Boolean(body?.pref_contact_email);
  const prefPhone = Boolean(body?.pref_contact_phone);
  const prefNewsEmail = Boolean(body?.pref_news_email);

  try {
    await queryOne(
      `UPDATE public.contacts
       SET pref_contact_email = $2, pref_contact_phone = $3, pref_news_email = $4, updated_at = now()
       WHERE id = $1
       RETURNING id`,
      [session.contactId, prefEmail, prefPhone, prefNewsEmail]
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err?.message || 'unknown'}` }, { status: 500 });
  }
}

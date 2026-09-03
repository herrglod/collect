import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdminSession } from '../../../../lib/auth-server';
import { queryOne } from '../../../../lib/db';
import { SITE_URL } from '../../../../lib/site';

const INVITE_TTL_DAYS = 14;

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contactId = Number(body?.contact_id);
  if (!contactId) {
    return NextResponse.json({ error: 'Invalid contact.' }, { status: 400 });
  }

  const contact = await queryOne<{ id: number; name: string; email: string | null }>(
    `SELECT id, name, email FROM public.contacts WHERE id = $1`,
    [contactId]
  );
  if (!contact) {
    return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
  }

  const existingAccount = await queryOne(`SELECT id FROM public.platform_users WHERE contact_id = $1`, [
    contactId,
  ]);
  if (existingAccount) {
    return NextResponse.json({ error: 'This contact already has access.' }, { status: 400 });
  }

  // Invalidate any previous, unaccepted invites for this contact so only the latest link works.
  await queryOne(
    `DELETE FROM public.collector_invites WHERE contact_id = $1 AND accepted_at IS NULL`,
    [contactId]
  );

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await queryOne(
    `INSERT INTO public.collector_invites (contact_id, token, email, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [contactId, token, contact.email, expiresAt]
  );

  return NextResponse.json({ ok: true, url: `${SITE_URL}/invite/${token}` });
}

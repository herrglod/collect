import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const contactId = Number(body?.contact_id);
  const archiveNumbers: string[] = Array.isArray(body?.archive_numbers)
    ? body.archive_numbers.filter((v: unknown) => typeof v === 'string')
    : [];
  const deliveredAtRaw = typeof body?.delivered_at === 'string' ? body.delivered_at.trim() : '';
  const deliveredAt = deliveredAtRaw.length > 0 ? deliveredAtRaw : null;

  if (!contactId || archiveNumbers.length === 0) {
    return NextResponse.json({ error: 'contact_id and archive_numbers are required.' }, { status: 400 });
  }

  const contact = await queryOne<{ id: number; type: string | null }>(
    `SELECT id, type FROM public.contacts WHERE id = $1`,
    [contactId]
  );
  if (!contact) {
    return NextResponse.json({ error: 'Gallery partner contact not found.' }, { status: 404 });
  }
  if (contact.type !== 'gallery') {
    return NextResponse.json({ error: 'Selected contact is not a gallery partner.' }, { status: 400 });
  }

  const errors: string[] = [];
  let assignedCount = 0;

  for (const archiveNumber of archiveNumbers) {
    try {
      await query(
        `INSERT INTO public.ownerships (contact_id, archive_number, delivered_at, status)
         VALUES ($1, $2, $3, 'stored')`,
        [contactId, archiveNumber, deliveredAt]
      );
      assignedCount++;
    } catch (err: any) {
      if (err?.code === '23505') {
        errors.push(`${archiveNumber}: already has an active owner.`);
      } else {
        errors.push(`${archiveNumber}: unexpected error.`);
      }
    }
  }

  return NextResponse.json({ ok: errors.length === 0, assignedCount, errors });
}

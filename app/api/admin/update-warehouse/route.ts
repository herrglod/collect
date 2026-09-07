import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const location =
    typeof body?.location === 'string' && body.location.trim().length > 0 ? body.location.trim() : null;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Missing warehouse id.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Warehouse name is required.' }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM public.warehouses WHERE name = $1 AND id != $2`, [name, id]);
  if (existing) {
    return NextResponse.json({ error: 'A warehouse with this name already exists.' }, { status: 409 });
  }

  const warehouse = await queryOne<{ id: number; name: string; location: string | null }>(
    `UPDATE public.warehouses SET name = $1, location = $2, updated_at = now() WHERE id = $3
     RETURNING id, name, location`,
    [name, location, id]
  );

  if (!warehouse) {
    return NextResponse.json({ error: 'Warehouse not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, warehouse });
}

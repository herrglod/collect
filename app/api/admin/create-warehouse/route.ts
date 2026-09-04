import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { requireAdminSession } from '../../../../lib/auth-server';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const location =
    typeof body?.location === 'string' && body.location.trim().length > 0 ? body.location.trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Warehouse name is required.' }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM public.warehouses WHERE name = $1`, [name]);
  if (existing) {
    return NextResponse.json({ error: 'A warehouse with this name already exists.' }, { status: 409 });
  }

  const warehouse = await queryOne<{ id: number; name: string; location: string | null }>(
    `INSERT INTO public.warehouses (name, location) VALUES ($1, $2) RETURNING id, name, location`,
    [name, location]
  );

  return NextResponse.json({ ok: true, warehouse });
}

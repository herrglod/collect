import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE_NAME, SessionPayload } from './session';
import { queryOne } from './db';

export async function getServerSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAdminSession(): Promise<SessionPayload | null> {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function getSessionDisplayName(session: SessionPayload): Promise<string> {
  if (session.contactId) {
    const contact = await queryOne<{ name: string }>(
      `SELECT name FROM public.contacts WHERE id = $1`,
      [session.contactId]
    );
    if (contact?.name) return contact.name;
  }
  return session.role === 'admin' ? 'Admin' : session.email;
}

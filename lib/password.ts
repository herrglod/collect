import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Avoids visually ambiguous characters (0/O, 1/l/I) so temp passwords are easy to read and retype.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

export function generateTempPassword(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

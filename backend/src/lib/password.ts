import bcrypt from 'bcryptjs';

/** bcrypt work factor: 10 rounds keeps hashing around 50–100 ms per call. */
const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

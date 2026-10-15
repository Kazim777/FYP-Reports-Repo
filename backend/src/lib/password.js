import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const READABLE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

export const hashPassword = (password) => bcrypt.hash(password, 10);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export function generateTemporaryPassword(length = 10) {
  return Array.from(crypto.randomBytes(length), (byte) => READABLE_CHARACTERS[byte % READABLE_CHARACTERS.length]).join('');
}

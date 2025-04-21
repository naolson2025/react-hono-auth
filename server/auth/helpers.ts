import { sign } from 'hono/jwt';
import { CookieOptions } from 'hono/utils/cookie';

export const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
  sameSite: 'Lax', // Or 'Strict'
  path: '/',
  maxAge: 86400, // 24 hours in seconds
} as CookieOptions;

export const generateToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId, // subject
    iat: now, // Issued At
    exp: now + 24 * 60 * 60, // Expiration Time (24 hours)
  };
  const token = await sign(payload, secret!);
  return token;
};

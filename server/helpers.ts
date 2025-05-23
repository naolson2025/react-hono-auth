import { sign } from 'hono/jwt';
import { CookieOptions } from 'hono/utils/cookie';

export const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
  sameSite: 'Lax', // Or 'Strict'
  path: '/', // makes the cookie available on all routes
  maxAge: 3600, // 1 hour
} as CookieOptions;

export const generateToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId, // subject
    iat: now, // Issued At
    exp: now + 1 * 60 * 60, // Expiration Time (1 hour)
  };
  const token = await sign(payload, secret!);
  return token;
};

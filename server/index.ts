import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { setCookie, deleteCookie } from 'hono/cookie';
import { jwt, sign } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { dbConn } from './db/db';
import { loginValidator } from './schemas/login-schema';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { insertUser } from './db/queries';

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not configured.');
  process.exit(1);
}

const db = dbConn();
const app = new Hono<{ Variables: JwtVariables }>();

async function generateToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(userId), // Subject (user ID)
    iat: now, // Issued At
    exp: now + 24 * 60 * 60, // Expiration Time (24 hours)
  };
  const token = await sign(payload, secret);
  return token;
}

const route = app
  .use('/*', serveStatic({ root: './client/dist' }))
  .use('/api/*', cors())
  .use('/api/*', csrf())
  .post('/api/signup', loginValidator, async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      const userId = await insertUser(email, password);

      // 2. JWT Generation
      const token = await generateToken(userId);

      // 3. Setting the Secure HttpOnly Cookie
      setCookie(c, 'authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
        sameSite: 'Lax', // Or 'Strict'
        path: '/',
        maxAge: 86400, // 24 hours in seconds
      });

      // 4. Return Success Response
      return c.json({
        message: 'User registered successfully',
        user: { id: userId, email: email },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('UNIQUE constraint failed')
      ) {
        return c.json({ error: 'Email already exists' }, 409);
      }
      console.error('Signup error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .post('/api/login', loginValidator, async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      // 2. Credential Verification
      const userQuery = db.query(
        'SELECT id, password_hash FROM users WHERE email =?'
      );
      const user = userQuery.get(email) as {
        id: string;
        password_hash: string;
      } | null;

      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verify password securely
      const passwordMatch = await Bun.password.verify(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // 3. JWT Generation
      const token = await generateToken(user.id);

      // 4. Setting the Secure HttpOnly Cookie
      setCookie(c, 'authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
        sameSite: 'Lax',
        path: '/',
        maxAge: 86400, // 24 hours in seconds
        // domain: 'yourdomain.com' // Optional: Specify if needed
      });

      // 5. Return Success Response
      return c.json({
        message: 'Login successful',
        user: { id: user.id, email: email },
      }); // Avoid sending hash
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .post('/api/logout', async (c) => {
    deleteCookie(c, 'authToken', {
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Match secure flag if used
      // domain: 'yourdomain.com' // Match domain if used
      // httpOnly doesn't need to be specified for deletion
    });

    return c.json({ message: 'Logout successful' });
  })
  .get(
    '/api/protected/me',
    jwt({ secret: process.env.JWT_SECRET!, cookie: 'authToken' }),
    async (c) => {
      const payload = c.get('jwtPayload'); // Access payload set by middleware

      if (!payload || !payload.sub) {
        // Should ideally not happen if middleware is working, but good practice
        return c.json({ error: 'Invalid token payload' }, 401);
      }

      try {
        // Fetch minimal user details using the user ID from the token (payload.sub)
        const userQuery = db.query('SELECT id, email FROM users WHERE id =?');
        const user = userQuery.get(payload.sub) as {
          id: string;
          email: string;
        } | null; // Ensure sub is converted if needed

        if (!user) {
          return c.json({ error: 'User not found' }, 404);
        }

        // Return non-sensitive user info
        return c.json({
          id: user.id,
          email: user.email,
          // Add other safe fields like username if available
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  );

export type AppType = typeof route;
export default app;

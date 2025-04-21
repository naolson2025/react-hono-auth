import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { setCookie, deleteCookie } from 'hono/cookie';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { dbConn } from './db/db';
import { loginValidator } from './schemas/login-schema';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { getUserByEmail, insertUser } from './db/queries';
import { cookieOpts, generateToken } from './auth/helpers';

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not configured.');
  process.exit(1);
}

const db = dbConn();
const app = new Hono<{ Variables: JwtVariables }>();

const route = app
  .use('/*', serveStatic({ root: './client/dist' }))
  .use('/api/*', cors())
  .use('/api/*', csrf())
  .post('/api/signup', loginValidator, async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      const userId = await insertUser(email, password);

      const token = await generateToken(userId);

      setCookie(c, 'authToken', token, cookieOpts);

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
      const user = getUserByEmail(email);

      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const passwordMatch = await Bun.password.verify(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const token = await generateToken(user.id);

      setCookie(c, 'authToken', token, cookieOpts);

      return c.json({
        message: 'Login successful',
        user: { id: user.id, email: email },
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .post('/api/logout', async (c) => {
    deleteCookie(c, 'authToken', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
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

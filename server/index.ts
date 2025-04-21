import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { setCookie, deleteCookie } from 'hono/cookie';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { loginValidator } from './schemas/login-schema';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { getUserByEmail, getUserById, insertUser } from './db/queries';
import { cookieOpts, generateToken } from './auth/helpers';
import { dbConn } from './db/db';

// Fail to start app if no JWT_SECRET is configured
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not configured.');
  process.exit(1);
}

const app = new Hono<{ Variables: JwtVariables }>();

const route = app
  .use('/*', serveStatic({ root: './client/dist' }))
  .use('/api/*', cors())
  .use('/api/*', csrf())
  .post('/api/signup', loginValidator, async (c) => {
    const db = dbConn();
    const { email, password } = c.req.valid('json');

    try {
      const userId = await insertUser(db, email, password);

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
    const db = dbConn();
    const { email, password } = c.req.valid('json');

    try {
      const user = getUserByEmail(db, email);

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
      const db = dbConn();
      const payload = c.get('jwtPayload');

      if (!payload || !payload.sub) {
        return c.json({ error: 'Invalid token payload' }, 401);
      }

      try {
        const user = getUserById(db, payload.sub);

        if (!user) {
          return c.json({ error: 'User not found' }, 404);
        }

        return c.json({
          id: user.id,
          email: user.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  );

export type AppType = typeof route;
export default app;

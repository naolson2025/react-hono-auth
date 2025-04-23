import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { getUserByEmail, getUserById, insertUser } from '../db/queries';
import { cookieOpts, generateToken } from '../auth/helpers';
import { dbConn } from '../db/db';
import { loginValidator } from '../schemas/login-schema';

export const auth = new Hono();

auth
  .post('/api/signup', loginValidator, async (c) => {
    const db = dbConn();
    const { email, password } = c.req.valid('json');

    try {
      const userId = await insertUser(db, email, password);

      const token = await generateToken(userId);

      setCookie(c, 'authToken', token, cookieOpts);

      return c.json(
        {
          message: 'User registered successfully',
          user: { id: userId, email: email },
        },
        201
      );
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
      sameSite: 'Lax',
      httpOnly: true,
    });

    return c.json({ message: 'Logout successful' });
  })
  .get('/api/auth/me', async (c) => {
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
  });

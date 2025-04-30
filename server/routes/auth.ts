import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import {
  getUserByEmail,
  getUserById,
  insertUser,
  updateUserPassword,
  validatePassword,
} from '../db/queries';
import { cookieOpts, generateToken } from '../helpers';
import { dbConn } from '../db/db';
import { loginValidator } from '../schemas/login-schema';
import { passwordUpdateValidator } from '../schemas/password-update-schema';

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
        return c.json({ errors: ['Email already exists'] }, 409);
      }
      console.error('Signup error:', error);
      return c.json({ errors: ['Internal server error'] }, 500);
    }
  })
  .post('/api/login', loginValidator, async (c) => {
    const db = dbConn();
    const { email, password } = c.req.valid('json');

    try {
      const user = getUserByEmail(db, email);

      if (!user) {
        return c.json({ errors: ['Invalid credentials'] }, 401);
      }

      const passwordMatch = await Bun.password.verify(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return c.json({ errors: ['Invalid credentials'] }, 401);
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
  })
  .patch('/api/auth/update-password', passwordUpdateValidator, async (c) => {
    const db = dbConn();
    const payload = c.get('jwtPayload');
    const { currentPassword, newPassword } = c.req.valid('json');

    if (!payload || !payload.sub) {
      return c.json({ error: 'Invalid token payload' }, 401);
    }

    try {
      const valid = await validatePassword(db, payload.sub, currentPassword);
      if (!valid) {
        return c.json({ error: 'Invalid current password' }, 401);
      }
      const user = await updateUserPassword(db, payload.sub, newPassword);

      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      return c.json({
        message: 'Password updated successfully',
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

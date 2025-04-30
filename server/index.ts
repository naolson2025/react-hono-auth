import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';
import { csrf } from 'hono/csrf';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { userSettings } from './routes/user-settings';

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
  .use(
    '/api/auth/*',
    jwt({ secret: process.env.JWT_SECRET!, cookie: 'authToken' })
  )
  .route('/', auth)
  .route('/api/auth/user-settings', userSettings);

export type AppType = typeof route;
export default app;

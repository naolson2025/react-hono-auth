import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const app = new Hono();

const route = app.use('/*', serveStatic({ root: './client/dist' }));

export type AppType = typeof route;
export default app;

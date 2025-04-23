import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { createTestDb } from './test/test-db';
import app from '.';
import { loginReq, signupReq, logoutReq } from './test/test-helpers';
import { Database } from 'bun:sqlite';

let db: Database;

mock.module('../server/db/db.ts', () => {
  return {
    dbConn: () => db,
  };
});

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

describe('signup endpoint', () => {
  it('should signup a user', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json).toEqual({
      message: 'User registered successfully',
      user: { id: expect.any(String), email: 'test@test.com' },
    });
    // expect a cookie to be set
    const cookies = res.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
    expect(cookies).toMatch(/HttpOnly/);
    expect(cookies).toMatch(/SameSite=Lax/);
    expect(cookies).toMatch(/Path=\//);
    expect(cookies).toMatch(/Max-Age=86400/);
  });

  it('should return 409 if email already exists', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(201);

    const req2 = signupReq();
    const res2 = await app.fetch(req2);
    const json = await res2.json();
    expect(res2.status).toBe(409);
    expect(json).toEqual({
      error: 'Email already exists',
    });
  });

  it('should return error if missing email or password', async () => {
    const req = signupReq('', '');
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: ['Invalid email', 'Password must be at least 10 characters long'],
    });
  });
});

describe('login endpoint', () => {
  it('should login a user', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(201);

    const login = loginReq();
    const res2 = await app.fetch(login);
    const json = await res2.json();
    expect(res2.status).toBe(200);
    expect(json).toEqual({
      message: 'Login successful',
      user: { id: expect.any(String), email: 'test@test.com' },
    });

    const cookies = res2.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=/);
    expect(cookies).toMatch(/HttpOnly/);
    expect(cookies).toMatch(/SameSite=Lax/);
    expect(cookies).toMatch(/Path=\//);
    expect(cookies).toMatch(/Max-Age=86400/);
  });

  it('should return 400 if email or password is missing', async () => {
    const req = loginReq('', '');
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: ['Invalid email', 'Password must be at least 10 characters long'],
    });
  });

  it('should return 401 if the email does not exist', async () => {
    const req = loginReq();
    const res = await app.fetch(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json).toEqual({
      error: 'Invalid credentials',
    });
  });

  it('should return 401 if the password is incorrect', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(201);

    const login = loginReq('test@test.com', 'wrongpassword');
    const res2 = await app.fetch(login);
    const json = await res2.json();
    expect(res2.status).toBe(401);
    expect(json).toEqual({
      error: 'Invalid credentials',
    });
  });
});

describe('logout endpoint', () => {
  it('should logout a user', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(201);

    const logout = logoutReq();
    const res2 = await app.fetch(logout);
    const json = await res2.json();
    expect(res2.status).toBe(200);
    expect(json).toEqual({
      message: 'Logout successful',
    });

    const cookies = res2.headers.get('set-cookie');
    expect(cookies).toMatch(/authToken=;/);
  });
});

describe('api/protected/me endpoint', () => {
  it('should return user data if authenticated', async () => {
    const req = signupReq();
    const res = await app.fetch(req);
    expect(res.status).toBe(201);

    const meReq = new Request('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        Cookie: res.headers.get('set-cookie')!,
      },
    });
    const res2 = await app.fetch(meReq);
    const json = await res2.json();
    expect(res2.status).toBe(200);
    expect(json).toEqual({
      id: expect.any(String),
      email: 'test@test.com',
    });
  });

  it('should return 401 if cookie is invalid', async () => {
    const meReq = new Request('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        Cookie: 'authToken=invalidtoken',
      },
    });
    const res2 = await app.fetch(meReq);
    const resBody = await res2.text()
    expect(res2.status).toBe(401);
    expect(resBody).toBe('Unauthorized');
  })
});
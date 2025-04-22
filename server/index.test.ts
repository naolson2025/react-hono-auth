import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { createTestDb } from './test/test-db';
import app from '.';
import { signupReq } from './test/test-helpers';
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
});

import { expect, it, mock } from 'bun:test'
import { createTestDb } from './test/test_db'
import app from '.'

mock.module('../server/db/db.ts', () => {
  return {
    dbConn: createTestDb,
  };
});

it('should signup a user', async () => {
  const req = new Request('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@test.com',
      password: 'password123',
    }),
  })
  const res = await app.fetch(req)
  const json = await res.json()
  expect(res.status).toBe(200)
  expect(json).toEqual({
    message: 'User registered successfully',
    user: { id: expect.any(String), email: 'test@test.com' },
  })
})
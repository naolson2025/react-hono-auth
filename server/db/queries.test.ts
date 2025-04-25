import { afterEach, beforeEach, expect, it } from 'bun:test';
import { insertUser, updateUserFavorites, getUserFavorites } from './queries';
import { createTestDb } from '../test/test-db';
import { Database } from 'bun:sqlite';

let db: Database;

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.close();
});

it('should insert a user into the database', async () => {
  const email = 'test1234@test.com';
  const password = 'password123';
  const userId = await insertUser(db, email, password);
  expect(userId).toBeDefined();
});

it('should throw an error if the email already exists', async () => {
  const email = 'test@test.com';
  const password = 'password123';
  await insertUser(db, email, password);
  try {
    await insertUser(db, email, password);
  }
  catch (error) {
    expect(error).toBeInstanceOf(Error);
    // @ts-ignore
    expect(error.message).toMatch(/UNIQUE constraint failed/);
  }
});

it('should throw an error if the password is empty', async () => {
  const email = 'test@test.com';
  const password = '';
  try {
    await insertUser(db, email, password);
  }
  catch (error) {
    expect(error).toBeInstanceOf(Error);
    // @ts-ignore
    expect(error.message).toMatch(/password must not be empty/);
  }
});

it('should update a users favorites', async () => {
  const email = 'test@test.com';
  const password = 'password123';
  const userId = await insertUser(db, email, password);
  const color = 'blue';
  const animal = 'dog';
  const user = updateUserFavorites(db, userId, color, animal);
  console.log(user);
})
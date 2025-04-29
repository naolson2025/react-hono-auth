import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  insertUser,
  updateUserFavorites,
  getUserFavorites,
  updateUserPassword,
} from './queries';
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
  } catch (error) {
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
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    // @ts-ignore
    expect(error.message).toMatch(/password must not be empty/);
  }
});

describe('updateUserFavorites', () => {
  it('should update a users favorites', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);
    const color = 'blue';
    const animal = 'dog';
    const user = updateUserFavorites(db, userId, color, animal);
    expect(user).toBeDefined();
    expect(user?.favorite_color).toBe(color);
    expect(user?.favorite_animal).toBe(animal);
  });

  it('should return null if user does not exist', async () => {
    const color = 'blue';
    const animal = 'dog';
    const user = updateUserFavorites(db, 'nonexistent-id', color, animal);
    expect(user).toBeNull();
  });
});

describe('getUserFavorites', () => {
  it('should get a users favorites', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);
    const color = 'blue';
    const animal = 'dog';
    updateUserFavorites(db, userId, color, animal);
    const user = getUserFavorites(db, userId);
    expect(user).toBeDefined();
    expect(user?.favorite_color).toBe(color);
    expect(user?.favorite_animal).toBe(animal);
  });

  it('should return null if user does not exist', async () => {
    const user = getUserFavorites(db, 'nonexistent-id');
    expect(user).toBeNull();
  });
});

describe('updateUserPassword', () => {
  it('should update a users password', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(db, email, password);
    const newPassword = 'newpassword123';
    const user = await updateUserPassword(db, userId, newPassword);
    expect(user).toBeDefined();
    expect(user?.email).toBe(email);

    // Verify that the password was updated
    const query = db.query('SELECT password_hash FROM users WHERE id = ?');
    const result = query.get(userId) as { password_hash: string }
    expect(result).toBeDefined();
    const valid = await Bun.password.verify(newPassword, result.password_hash)
    expect(valid).toBe(true);
  });
});

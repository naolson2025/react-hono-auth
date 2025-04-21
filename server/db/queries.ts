import { dbConn } from './db';
import { randomUUID, type UUID } from 'crypto';
import { Database } from 'bun:sqlite';

export const insertUser = async (db: Database, email: string, password: string) => {
  const userId = randomUUID();
  // salt is automatically generated & included
  const passwordHash = await Bun.password.hash(password);

  const insertQuery = db.query(
    `
    INSERT INTO users (id, email, password_hash)
    VALUES (?, ?, ?)
    RETURNING id
    `
  );
  const user = insertQuery.get(userId, email, passwordHash) as {
    id: UUID;
  };
  return user.id;
};

export const getUserByEmail = (db: Database, email: string) => {
  const userQuery = db.query(
    'SELECT id, password_hash FROM users WHERE email =?'
  );
  const user = userQuery.get(email) as {
    id: string;
    password_hash: string;
  } | null;
  return user;
}

export const getUserById = (db: Database, id: string) => {
  const userQuery = db.query('SELECT id, email FROM users WHERE id =?');
  const user = userQuery.get(id) as {
    id: string;
    email: string;
  } | null;
  return user;
}
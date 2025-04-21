import { dbConn } from './db';
import { randomUUID, type UUID } from 'crypto';

export const insertUser = async (email: string, password: string) => {
  const db = dbConn();
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

import { randomUUID, type UUID } from 'crypto';
import { Database } from 'bun:sqlite';

export const insertUser = async (
  db: Database,
  email: string,
  password: string
) => {
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
};

export const getUserById = (db: Database, id: string) => {
  const userQuery = db.query('SELECT id, email FROM users WHERE id =?');
  const user = userQuery.get(id) as {
    id: string;
    email: string;
  } | null;
  return user;
};

export const getUserFavorites = (db: Database, id: string) => {
  const favoritesQuery = db.query(
    'SELECT color, animal FROM users WHERE id =?'
  );
  const user = favoritesQuery.get(id) as {
    color: string;
    animal: string;
  } | null;
  return user;
}

export const updateUserFavorites = (
  db: Database,
  id: string,
  color?: string,
  animal?: string,
) => {
  const updateQuery = db.query(
    'UPDATE users SET favorite_color = ?, favorite_animal = ? WHERE id = ?'
  );
  const user = updateQuery.run(color ?? null, animal ?? null, id);
  return user;
}
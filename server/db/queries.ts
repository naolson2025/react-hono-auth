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

export const validatePassword = async (
  db: Database,
  id: string,
  password: string
) => {
  const userQuery = db.query(
    'SELECT password_hash FROM users WHERE id =?'
  );
  const user = userQuery.get(id) as {
    password_hash: string;
  } | null;
  if (!user) {
    return false;
  }
  const passwordMatch = await Bun.password.verify(
    password,
    user.password_hash
  );
  return passwordMatch;
};

export const updateUserPassword = async (
  db: Database,
  id: string,
  password: string
) => {
  const passwordHash = await Bun.password.hash(password);

  const updateQuery = db.query(
    `
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
    RETURNING id, email
    `
  );
  const user = updateQuery.get(passwordHash, id) as {
    id: string;
    email: string;
  } | null;
  return user;
};

export const getUserFavorites = (db: Database, id: string) => {
  const favoritesQuery = db.query(
    'SELECT id, favorite_color, favorite_animal FROM users WHERE id =?'
  );
  const user = favoritesQuery.get(id) as {
    id: string;
    favorite_color: string;
    favorite_animal: string;
  } | null;
  return user;
};

export const updateUserFavorites = (
  db: Database,
  id: string,
  color?: string,
  animal?: string
) => {
  const updateQuery = db.query(
    `
    UPDATE users
    SET favorite_color = ?, favorite_animal = ?
    WHERE id = ?
    RETURNING id, favorite_color, favorite_animal`
  );
  const user = updateQuery.get(color ?? null, animal ?? null, id);
  return user as {
    id: string;
    favorite_color: string;
    favorite_animal: string;
  } | null;
};

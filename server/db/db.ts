import { Database } from 'bun:sqlite';
import { join } from 'path';

// set to root directory
const dbPath = join('.', 'db.sqlite');

let db: Database;

export const dbConn = () => {
  if (!db) {
    db = new Database(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        favorite_color TEXT,
        favorite_animal TEXT
      );
    `);

    console.log('Database created');
  }

  console.log('Database connected');
  return db;
};

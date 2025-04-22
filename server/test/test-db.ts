import { Database } from 'bun:sqlite';
import { applySchema } from '../db/db';

/**
 * Creates a fresh, in-memory SQLite database instance for testing.
 * Applies the necessary schema (e.g., PRAGMA, CREATE TABLE).
 *
 * @returns {Database} A new Bun SQLite Database instance.
 */
export const createTestDb = (): Database => {
  // Use ':memory:' to create a temporary, in-memory database.
  // Each call creates a completely separate database.
  const db = new Database(':memory:');

  // Apply necessary PRAGMAs (optional for :memory:, but good for consistency)
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;'); // Good practice to enable foreign key constraints

  applySchema(db);

  // console.log('In-memory test database created and schema applied.');
  return db;
};
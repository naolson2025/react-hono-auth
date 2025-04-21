import { afterEach, beforeEach, expect, it } from 'bun:test'
import { insertUser } from './queries'
import { createTestDb } from '../test/test_db'
import { Database } from 'bun:sqlite'

let db: Database

beforeEach(() => {
  db = createTestDb()
})

afterEach(() => {
  db.close()
})

it('should insert a user into the database', async () => {
  const email = 'test1234@test.com'
  const password = 'password123'
  const userId = await insertUser(db, email, password)
  expect(userId).toBeDefined()
})
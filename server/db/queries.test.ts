import { expect, it } from 'bun:test'
import { insertUser } from './queries'

it('should insert a user into the database', async () => {
  const email = 'test1234@test.com'
  const password = 'password123'
  const userId = await insertUser(email, password)
  expect(userId).toBeDefined()
})
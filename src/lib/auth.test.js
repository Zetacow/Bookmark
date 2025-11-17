import { describe, expect, it } from 'vitest'
import { authenticate } from './auth'

describe('authenticate', () => {
  it('returns a user object when the credentials are valid', () => {
    const user = authenticate('otaku', 'manga123')
    expect(user).toMatchObject({ username: 'otaku' })
  })

  it('normalizes the username before matching', () => {
    const user = authenticate('  OTAKU  ', 'manga123')
    expect(user).toMatchObject({ username: 'otaku' })
  })

  it('returns null for invalid credentials', () => {
    expect(authenticate('unknown', 'nope')).toBeNull()
  })
})

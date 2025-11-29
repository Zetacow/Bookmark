import { describe, expect, it } from 'vitest'
import { authenticate, getDemoUsers } from './auth'

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

  it('rejects missing usernames and passwords', () => {
    expect(authenticate('', 'manga123')).toBeNull()
    expect(authenticate('otaku', '')).toBeNull()
    expect(authenticate(null, 'manga123')).toBeNull()
    expect(authenticate('otaku', null)).toBeNull()
  })

  it('does not expose passwords on returned user objects', () => {
    const user = authenticate('otaku', 'manga123')
    expect(user).not.toHaveProperty('password')
  })
})

describe('getDemoUsers', () => {
  it('returns safe copies without passwords', () => {
    const demo = getDemoUsers()
    expect(demo).toEqual([
      {
        username: 'otaku',
        displayName: 'Resident Collector',
      },
    ])
  })

  it('returns new objects to avoid accidental mutation', () => {
    const [user] = getDemoUsers()
    user.displayName = 'Changed'

    const [freshUser] = getDemoUsers()
    expect(freshUser.displayName).toBe('Resident Collector')
  })
})

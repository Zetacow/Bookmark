import { describe, expect, it } from 'vitest'
import { buildGoogleUser } from './googleAuth'

const encodeSegment = (payload) =>
  btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const makeCredential = (payload) =>
  `${encodeSegment({ alg: 'RS256', typ: 'JWT' })}.${encodeSegment(payload)}.signature`

describe('buildGoogleUser', () => {
  it('returns a sanitized user when payload is valid', () => {
    const credential = makeCredential({
      sub: 'abc123',
      email: 'user@example.com',
      name: 'Example User',
      picture: 'https://example.com/avatar.png',
    })

    expect(buildGoogleUser(credential)).toEqual({
      username: 'user@example.com',
      displayName: 'Example User',
      provider: 'google',
      email: 'user@example.com',
      avatar: 'https://example.com/avatar.png',
    })
  })

  it('returns null when the credential is missing required fields', () => {
    const credential = makeCredential({ email: 'no-sub@example.com' })
    expect(buildGoogleUser(credential)).toBeNull()
  })

  it('returns null for malformed tokens', () => {
    expect(buildGoogleUser('not-a-token')).toBeNull()
    expect(buildGoogleUser('..broken..')).toBeNull()
  })
})

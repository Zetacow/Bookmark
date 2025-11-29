function decodeBase64Url(segment) {
  if (!segment) return null
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  try {
    const json = atob(padded)
    return JSON.parse(json)
  } catch (error) {
    console.warn('Failed to decode Google credential payload', error)
    return null
  }
}

export function buildGoogleUser(credential) {
  if (!credential || typeof credential !== 'string') return null
  const parts = credential.split('.')
  if (parts.length < 2) return null

  const payload = decodeBase64Url(parts[1])
  if (!payload || !payload.sub) return null

  const displayName = payload.name || payload.email || 'Google user'
  const username = payload.email || payload.sub

  return {
    username,
    displayName,
    provider: 'google',
    email: payload.email,
    avatar: payload.picture,
  }
}

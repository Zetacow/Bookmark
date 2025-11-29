const demoUsers = Object.freeze([
  Object.freeze({
    username: 'otaku',
    password: 'manga123',
    displayName: 'Resident Collector',
    provider: 'demo',
  }),
])

function sanitizeUsername(username) {
  if (typeof username !== 'string') return ''
  return username.trim().toLowerCase()
}

function isInvalidPassword(password) {
  return typeof password !== 'string' || password.length === 0
}

export function authenticate(username, password) {
  const trimmedUser = sanitizeUsername(username)
  if (!trimmedUser || isInvalidPassword(password)) {
    return null
  }

  const match = demoUsers.find((user) => user.username === trimmedUser)
  if (match && match.password === password) {
    const safeUser = { ...match }
    delete safeUser.password
    safeUser.provider = safeUser.provider || 'demo'
    return safeUser
  }
  return null
}

export function getDemoUsers() {
  return demoUsers.map((user) => {
    const sanitized = { ...user }
    delete sanitized.password
    return sanitized
  })
}

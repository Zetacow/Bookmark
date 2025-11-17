const demoUsers = [
  {
    username: 'otaku',
    password: 'manga123',
    displayName: 'Resident Collector',
  },
]

export function authenticate(username, password) {
  const trimmedUser = username.trim().toLowerCase()
  const match = demoUsers.find((user) => user.username === trimmedUser)
  if (match && match.password === password) {
    return { username: match.username, displayName: match.displayName }
  }
  return null
}

export function getDemoUsers() {
  return demoUsers.map(({ password, ...rest }) => rest)
}

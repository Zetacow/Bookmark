import { useEffect, useMemo, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import MangaDashboard from './components/MangaDashboard'
import { authenticate } from './lib/auth'
import { buildGoogleUser } from './lib/googleAuth'

const STORAGE_KEYS = {
  user: 'bookmark_user',
  manga: 'bookmark_manga',
}

const defaultUser = null
const defaultManga = []

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch (error) {
    console.warn('Unable to read storage', error)
    return fallback
  }
}

function App({ googleAuthEnabled = false }) {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.user, defaultUser))
  const [mangaList, setMangaList] = useState(() => readStorage(STORAGE_KEYS.manga, defaultManga))
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) {
      window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.user)
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.manga, JSON.stringify(mangaList))
  }, [mangaList])

  const ownedCount = useMemo(() => mangaList.filter((item) => item.collection === 'owned').length, [mangaList])
  const wishlistCount = useMemo(
    () => mangaList.filter((item) => item.collection === 'wishlist').length,
    [mangaList]
  )

  const handleLogin = ({ username, password }) => {
    const session = authenticate(username, password)
    if (!session) {
      setLoginError('Invalid username or password.')
      return
    }
    setLoginError('')
    setUser(session)
  }

  const handleGoogleCredential = (credential) => {
    const googleUser = buildGoogleUser(credential)
    if (!googleUser) {
      setLoginError('We could not verify your Google login. Please try again.')
      return
    }
    setLoginError('')
    setUser(googleUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleAddManga = (entry) => {
    setMangaList((prev) => [entry, ...prev])
  }

  const handleRemoveManga = (id) => {
    setMangaList((prev) => prev.filter((item) => item.id !== id))
  }

  if (!user) {
    return (
      <main className="app">
        <LoginForm
          onLogin={handleLogin}
          onGoogleCredential={googleAuthEnabled ? handleGoogleCredential : undefined}
          onAuthError={setLoginError}
          error={loginError}
          googleEnabled={googleAuthEnabled}
        />
      </main>
    )
  }

  return (
    <main className="app">
      <section className="collection-summary">
        <div>
          <p className="eyebrow">Owned</p>
          <p className="stat">{ownedCount}</p>
        </div>
        <div>
          <p className="eyebrow">Wishlist</p>
          <p className="stat">{wishlistCount}</p>
        </div>
      </section>
      <MangaDashboard
        user={user}
        mangaList={mangaList}
        onAddManga={handleAddManga}
        onRemoveManga={handleRemoveManga}
        onLogout={handleLogout}
      />
    </main>
  )
}

export default App

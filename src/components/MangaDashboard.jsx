import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { searchMangaOnline, buildMangaEntry } from '../lib/manga'

const defaultForm = {
  title: '',
  status: 'owned',
}

function MangaDashboard({ user, mangaList, onAddManga, onRemoveManga, onLogout }) {
  const [formState, setFormState] = useState(defaultForm)
  const [filter, setFilter] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [lastVerification, setLastVerification] = useState(null)

  const filteredManga = useMemo(() => {
    if (!filter.trim()) {
      return mangaList
    }
    const safeFilter = filter.trim().toLowerCase()
    return mangaList.filter((item) => item.title.toLowerCase().includes(safeFilter))
  }, [filter, mangaList])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formState.title.trim()) {
      setError('Please enter a title to search for.')
      return
    }

    setIsVerifying(true)
    try {
      const verification = await searchMangaOnline(formState.title)
      if (!verification) {
        setError('We could not verify that title. Please try another search term.')
        return
      }

      if (verification.isFallback) {
        setError('Using cached data while Jikan is unavailable. Please retry later for the latest info.')
      }

      const entry = buildMangaEntry(verification, formState.status)
      onAddManga(entry)
      setLastVerification({
        title: verification.title,
        chapters: verification.chapters,
        score: verification.score,
        url: verification.url,
      })
      setFormState((prev) => ({ ...prev, title: '' }))
    } catch (verificationError) {
      setError(verificationError.message || 'Something went wrong while verifying.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="user-meta">
          <p className="eyebrow">Signed in as</p>
          <div className="user-identity">
            {user.avatar && <img src={user.avatar} alt="Profile avatar" className="avatar" />}
            <div>
              <h2>{user.displayName}</h2>
              <p className="hint">
                {user.provider === 'google' ? 'Google account' : 'Demo account'}
                {user.email ? ` · ${user.email}` : ''}
              </p>
            </div>
          </div>
          <p className="hint">Keep your collection synced with live data from MyAnimeList.</p>
        </div>
        <button type="button" onClick={onLogout} className="ghost">
          Log out
        </button>
      </header>

      <section className="panel">
        <div>
          <h3>Add to your vault</h3>
          <p className="subtitle">
            We search the public Jikan API to make sure that every title you add is real.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="manga-form">
          <label>
            <span>Manga title</span>
            <input
              name="title"
              type="text"
              placeholder="e.g. One Piece"
              value={formState.title}
              onChange={handleInputChange}
              disabled={isVerifying}
              required
            />
          </label>
          <label>
            <span>Collection</span>
            <select name="status" value={formState.status} onChange={handleInputChange} disabled={isVerifying}>
              <option value="owned">Owned</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary" disabled={isVerifying}>
            {isVerifying ? 'Verifying…' : 'Add manga'}
          </button>
        </form>
        {lastVerification && (
          <div className="verification">
            <p>Last verified:</p>
            <a href={lastVerification.url} target="_blank" rel="noreferrer">
              {lastVerification.title}
            </a>
            <p>
              Chapters: {lastVerification.chapters ?? 'TBD'} · Score: {lastVerification.score ?? 'N/A'}
            </p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Your manga vault</h3>
            <p className="subtitle">
              Filter and organize the series you own or track for later pickup.
            </p>
          </div>
          <input
            type="search"
            placeholder="Filter by title"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
        <div className="manga-grid">
          {filteredManga.length === 0 ? (
            <p className="hint">No manga added yet.</p>
          ) : (
            filteredManga.map((manga) => (
              <article key={manga.id} className="manga-card">
                {manga.imageUrl && (
                  <img src={manga.imageUrl} alt={manga.title} loading="lazy" />
                )}
                <div>
                  <h4>{manga.title}</h4>
                  <p className="eyebrow">{manga.collection === 'owned' ? 'Owned' : 'Wishlist'}</p>
                  <p className="hint">
                    Chapters: {manga.chapters ?? 'TBD'} · Score: {manga.score ?? 'N/A'}
                  </p>
                </div>
                <div className="manga-card__actions">
                  <a href={manga.url} target="_blank" rel="noreferrer">
                    View on MAL
                  </a>
                  <button type="button" onClick={() => onRemoveManga(manga.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

MangaDashboard.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    provider: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  mangaList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      chapters: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      url: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      collection: PropTypes.oneOf(['owned', 'wishlist']).isRequired,
    })
  ).isRequired,
  onAddManga: PropTypes.func.isRequired,
  onRemoveManga: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
}

export default MangaDashboard

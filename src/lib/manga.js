const API_BASE = 'https://api.jikan.moe/v4/manga'
const CACHE_KEY = 'bookmark_last_manga_lookup'
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

function readCache() {
  if (typeof window === 'undefined') return null

  try {
    const rawCache = window.localStorage.getItem(CACHE_KEY)
    if (!rawCache) return null

    const parsed = JSON.parse(rawCache)
    return parsed?.result && parsed?.query ? parsed : null
  } catch (error) {
    console.warn('Unable to read manga cache', error)
    return null
  }
}

function writeCache(query, result) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        query,
        result,
        timestamp: Date.now(),
      })
    )
  } catch (error) {
    console.warn('Unable to persist manga cache', error)
  }
}

function isCacheFresh(cache) {
  if (!cache?.timestamp) return false
  return Date.now() - cache.timestamp < CACHE_TTL_MS
}

function buildCachedResult(result, isFallback = false) {
  return {
    ...result,
    fromCache: true,
    isFallback,
  }
}

function createRateLimitError() {
  const rateLimitError = new Error(
    'Jikan is rate limiting requests right now. Please wait a few seconds and try again.'
  )
  rateLimitError.code = 'RATE_LIMIT'
  return rateLimitError
}

function createNetworkError() {
  const networkError = new Error(
    'We could not reach the verification service. Check your connection and try again shortly.'
  )
  networkError.code = 'NETWORK_UNAVAILABLE'
  return networkError
}

export async function searchMangaOnline(query) {
  const normalizedQuery = query.trim().toLowerCase()
  const cachedLookup = readCache()
  const isCachedMatch = cachedLookup?.query === normalizedQuery

  if (isCachedMatch && isCacheFresh(cachedLookup)) {
    return buildCachedResult(cachedLookup.result)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${API_BASE}?q=${encodeURIComponent(query)}&order_by=popularity&limit=1`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw createRateLimitError()
      }
      throw new Error('Verification failed. Please try again later.')
    }

    const payload = await response.json()
    const [firstResult] = payload.data || []
    const mapped = firstResult ? mapApiResult(firstResult) : null

    if (mapped) {
      writeCache(normalizedQuery, mapped)
    }

    return mapped
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Verification timed out. Try again in a moment.')
    }

    if (isCachedMatch && cachedLookup?.result) {
      return buildCachedResult(cachedLookup.result, true)
    }

    if (error.code === 'RATE_LIMIT') {
      throw error
    }

    if (error.code === 'NETWORK_UNAVAILABLE' || error.name === 'TypeError') {
      throw createNetworkError()
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function mapApiResult(result) {
  return {
    id: String(result.mal_id),
    title: result.title || result.title_english || 'Untitled',
    chapters: result.chapters ?? result.published?.string ?? null,
    score: result.score ?? null,
    url: result.url,
    imageUrl: result.images?.jpg?.large_image_url || result.images?.webp?.large_image_url || '',
  }
}

export function buildMangaEntry(apiResult, collection) {
  const slug =
    apiResult.id ||
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`)
  return {
    ...apiResult,
    id: `${slug}-${collection}-${Date.now()}`,
    collection,
    addedAt: new Date().toISOString(),
  }
}

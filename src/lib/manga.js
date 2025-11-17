const API_BASE = 'https://api.jikan.moe/v4/manga'

export async function searchMangaOnline(query) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${API_BASE}?q=${encodeURIComponent(query)}&order_by=popularity&limit=1`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error('Verification failed. Please try again later.')
    }

    const payload = await response.json()
    const [firstResult] = payload.data || []
    return firstResult ? mapApiResult(firstResult) : null
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Verification timed out. Try again in a moment.')
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

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchMangaOnline } from './manga'

const buildApiResult = (overrides = {}) => ({
  mal_id: 1,
  title: 'One Piece',
  url: 'https://example.com/one-piece',
  score: 9.5,
  chapters: 1000,
  images: { jpg: { large_image_url: 'https://example.com/cover.jpg' } },
  ...overrides,
})

const mockFetchResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => ({ data }),
})

describe('searchMangaOnline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    global.fetch = vi.fn()
  })

  it('surfaces retry guidance when the API rate limits requests', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse([], 429))

    await expect(searchMangaOnline('One Piece')).rejects.toThrow(/rate limiting/i)
  })

  it('reuses a fresh cached lookup to avoid repeat network calls', async () => {
    fetch.mockResolvedValueOnce(mockFetchResponse([buildApiResult()]))

    const initial = await searchMangaOnline('One Piece')
    expect(initial.fromCache).toBeUndefined()

    const cached = await searchMangaOnline('One Piece')
    expect(cached.fromCache).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to the last cached result when the network is unavailable', async () => {
    fetch
      .mockResolvedValueOnce(mockFetchResponse([buildApiResult({ title: 'Naruto' })]))
      .mockRejectedValueOnce(new TypeError('Network error'))

    await searchMangaOnline('Naruto')
    const cached = JSON.parse(window.localStorage.getItem('bookmark_last_manga_lookup'))
    window.localStorage.setItem(
      'bookmark_last_manga_lookup',
      JSON.stringify({ ...cached, timestamp: Date.now() - 11 * 60 * 1000 })
    )
    const fallback = await searchMangaOnline('Naruto')

    expect(fallback.isFallback).toBe(true)
    expect(fallback.fromCache).toBe(true)
    expect(fallback.title).toBe('Naruto')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { buildMangaEntry, mapApiResult, searchMangaOnline } from './manga'

describe('mapApiResult', () => {
  it('creates a normalized payload with fallbacks', () => {
    const result = mapApiResult({
      mal_id: 1,
      title_english: 'Fallback Title',
      url: 'https://example.com',
      images: { jpg: { large_image_url: 'https://img.com' } },
    })
    expect(result.title).toBe('Fallback Title')
    expect(result.chapters).toBeNull()
  })
})

describe('buildMangaEntry', () => {
  it('adds metadata to the mapped result', () => {
    const entry = buildMangaEntry(
      { id: '123', title: 'Demo', url: 'https://example.com' },
      'owned',
    )
    expect(entry.collection).toBe('owned')
    expect(entry.id).toContain('123')
    expect(entry.addedAt).toBeTruthy()
  })
})

describe('searchMangaOnline', () => {
  it('throws when the API returns an error status', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve({ ok: false }))
    await expect(searchMangaOnline('bad')).rejects.toThrow('Verification failed')
    vi.unstubAllGlobals()
  })
})

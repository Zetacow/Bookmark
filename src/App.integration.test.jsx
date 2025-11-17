import { describe, it, beforeEach, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { searchMangaOnline } from './lib/manga'

vi.mock('./lib/manga', async () => {
  const actual = await vi.importActual('./lib/manga')
  return {
    ...actual,
    searchMangaOnline: vi.fn(),
  }
})

const mockManga = (overrides = {}) => ({
  id: '1',
  title: 'One Piece',
  chapters: 1000,
  score: 9.1,
  url: 'https://example.com/one-piece',
  imageUrl: 'https://example.com/one-piece.jpg',
  ...overrides,
})

describe('App integration flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  it('lets a user login, add, filter, and remove manga entries', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/username/i), 'otaku')
    await user.type(screen.getByLabelText(/password/i), 'manga123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    const addButton = await screen.findByRole('button', { name: /add manga/i })

    searchMangaOnline.mockResolvedValueOnce(mockManga())
    const titleInput = screen.getByLabelText(/manga title/i)
    await user.type(titleInput, 'One Piece')
    await user.click(addButton)

    await screen.findByRole('heading', { name: 'One Piece' })

    searchMangaOnline.mockResolvedValueOnce(
      mockManga({
        id: '2',
        title: 'Hunter x Hunter',
        chapters: 390,
        url: 'https://example.com/hxh',
      })
    )
    await user.clear(titleInput)
    await user.type(titleInput, 'Hunter x Hunter')
    await user.selectOptions(screen.getByLabelText(/collection/i), ['wishlist'])
    await user.click(addButton)

    await screen.findByRole('heading', { name: 'Hunter x Hunter' })

    const filterInput = screen.getByPlaceholderText('Filter by title')
    await user.type(filterInput, 'Hunter')

    expect(screen.getByRole('heading', { name: 'Hunter x Hunter' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'One Piece' })).not.toBeInTheDocument()

    await user.clear(filterInput)
    await user.type(filterInput, 'One')
    expect(await screen.findByRole('heading', { name: 'One Piece' })).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /remove/i })[0])

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'One Piece' })).not.toBeInTheDocument()
    )

    await user.clear(filterInput)
    expect(await screen.findByRole('heading', { name: 'Hunter x Hunter' })).toBeInTheDocument()
  })
})

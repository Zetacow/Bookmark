# Bookmark

A Vite + React single-page application for tracking manga that you own or plan to buy. Login with the demo credentials to add new titles that are verified in real time through the public [Jikan API](https://jikan.moe/).

## Getting started

```bash
npm install
npm run dev
```

The development server boots on <http://localhost:5173>. Use the built-in demo account:

- **Username:** `otaku`
- **Password:** `manga123`

## Available scripts

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Start the Vite dev server with hot reload |
| `npm run build`| Produce a production build                |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint on the project                 |
| `npm run test` | Execute unit tests via Vitest             |

## How it works

1. Authenticate with the static demo account to unlock the dashboard.
2. When you add a title, the app queries Jikan/MyAnimeList to ensure the manga exists before storing it locally.
3. Your owned and wishlist entries persist in `localStorage` so they survive page reloads.

## Notes on robustness

- `src/lib/auth.test.js` and `src/lib/manga.test.js` contain unit tests that validate the credential helper and the API mapping logic.
- API calls include a timeout guard to fail gracefully when the remote service is unreachable.

# News Aggregator — Frontend

Next.js (App Router) frontend for the clustered-news FastAPI backend.

## Prerequisites

- Node 18+ (tested on v22).
- Backend running on `http://localhost:8000` (see `../backend`). The frontend fetches
  server-side, so the backend must be reachable from the Next.js server process.

## Setup

```bash
npm install
```

Configure the API base in `.env.local`:

```
API_BASE_URL=http://localhost:8000
```

## Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Architecture

- **Server Components fetch the first page.** `app/page.tsx` and `app/clusters/[id]/page.tsx`
  call `lib/api.ts` on the server — no CORS, no client data-fetching library.
- **URL is the filter state.** Category and the Tunisia toggle (`?tunisian=true`) and the search
  box write to the query string. `CategoryBar` pushes to the router; the server re-renders and
  hands a fresh first page to the feed.
- **Infinite scroll.** `components/Feed.tsx` (client) renders the server's first page, then an
  `IntersectionObserver` fetches and *appends* later pages from the `app/api/clusters` route
  handler — a thin server-side proxy to FastAPI (keeps the browser off the API, no CORS).
- **Client islands** (`"use client"`): `Feed`, `CategoryBar`, `SearchBar`. Everything else is a
  Server Component.
- **Tunisia is a chip, not a page** — it sets `?tunisian=true` in the same category bar.
- **Styling:** Tailwind CSS v4 with a small token set (`paper`/`ink`/`muted`/`hairline`/`accent`)
  and Newsreader (display) + Geist (sans) + Geist Mono (data) fonts.

## Notes

- **Search bar is a UI stub.** It pushes `?q=` to the URL but nothing consumes it yet — the
  backend has no search endpoint. Placeholder for a future Elasticsearch integration.
- `image` can be null; `ClusterImage` renders a category-colored placeholder in that case.
- The Tunisia filter is backend-handled (`?tunisian=true`); the frontend does not reconstruct it.

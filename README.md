# Spot On Top

A billboard-style advertising marketplace connecting brands with audiences across India and the USA, built in React from the `Spot-on-website.pdf` design.

Every number and piece of content on the page comes through one API layer. Out of the box it answers from **demo data**; point it at your backend and the same page shows live data, with no component changes.

## Quick start

Requires **Node.js 18 or newer**.

```bash
npm install
npm run dev         # http://localhost:5173 — runs on demo data
```

```bash
npm run build       # production build in dist/
npm run preview     # serve the production build
npm run mock-api    # local mock REST API on http://localhost:8787 (see "Testing")
```

---

## Connecting your API

Everything is controlled from **one file**: `src/config/api.config.js`.

**1. Set the address.** Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/v1
VITE_USE_DEMO_DATA=false
```

**2. Check the endpoint paths** in `ENDPOINTS` (inside `api.config.js`). Change any path to match your backend:

```js
brands: { method: 'GET', path: '/brands' },
heroStats: { method: 'GET', path: '/stats/hero' },
```

A path can also be a full URL, so one resource can come from a different service:

```js
trafficSnapshot: { method: 'GET', path: 'https://analytics.yourdomain.com/live' },
```

**3. Restart** `npm run dev`. That's it.

### Switching over one endpoint at a time

Keep `VITE_USE_DEMO_DATA=true` and flip individual endpoints as your backend gains them:

```js
brands: { method: 'GET', path: '/brands', demo: false },   // live
pricing: { method: 'GET', path: '/pricing' },                // still demo
```

### When your API returns a different shape

Map it in `src/services/adapters.js`, never in a component. Each adapter receives the raw JSON and returns the shape the UI expects (documented in the matching `src/demo-data/*.js` file):

```js
brands: (raw) =>
  raw.items.map((b) => ({
    id: b.uuid,
    name: b.display_name,
    pitch: b.tagline,
    views: b.metrics.views,
    clicks: b.metrics.contact_clicks,
    // …
  })),
```

`requestAdapters` in the same file reshape outgoing payloads (quotes, votes, waitlist) if your backend expects different field names.

### Other settings in `api.config.js`

| Setting | Purpose |
| --- | --- |
| `token` (`VITE_API_TOKEN`) | Sent as `Authorization: Bearer …`. **Public tokens only.** |
| `withCredentials` | Send cookies for session-based auth on another domain |
| `headers` | Extra headers on every request |
| `timeoutMs` | Abort slow requests (default 15 s) |
| `polling.heroStats`, `polling.trafficSnapshot` | How often live numbers refresh. Demo: 1–2.5 s; a real API is usually 5–30 s |

---

## About Meta (Business Suite) data

Meta Business Suite doesn't have its own API: its numbers come from Meta's **Graph API** (Page and Instagram insights) and, for ads, the **Marketing API**.

Two important points:

1. **Call Meta from your backend, not from this app.** Anything in `.env` with the `VITE_` prefix is bundled into the browser code and visible to every visitor. A Meta access token or app secret there would be exposed. Have your backend fetch from Meta, then point the endpoints in `api.config.js` at your backend.
2. **Not every number on the page is a Meta metric.** Live website visitors, banner views and enquiries describe traffic on spotontop.com itself and would come from your own site analytics. Meta covers the Instagram and Facebook side. Because each endpoint can have its own URL, mixing sources is fine.

`src/services/adapters.js` includes a `fromGraphInsights()` helper that flattens Graph API insights responses (`{ data: [{ name, values: [{ value }] }] }`) into `{ metricName: latestValue }`, with a commented example. Metric names change between API versions, so confirm them against Meta's current documentation.

---

## Endpoint reference

Response shapes match the files in `src/demo-data/`. `npm run mock-api` serves them over HTTP, which makes it a living reference for your backend.

| Name | Method & path | Used by | Returns |
| --- | --- | --- | --- |
| `appSettings` | `GET /settings` | Prices, currency switch, GST | `{ usdRate, gstRate }` |
| `heroStats` | `GET /stats/hero?market=usa\|india` | Hero card (polled) | `{ peopleNow, visitsToday, contactClicks, clickRate, feed[], preview }` |
| `trafficSnapshot` | `GET /stats/traffic?market=all\|india\|usa` | Live Traffic (polled) | `{ totals, history[60], cities[], otherShare, feed[], weekly[] }` |
| `slots` | `GET /slots` | Banner Board, Quote Builder, How it works | `Slot[]` |
| `brands` | `GET /brands` | Brand directory | `Brand[]` (with `updatedAt` ISO date) |
| `featured` | `GET /featured` | Spot on this week | `{ slides[], spotOfTheWeek, comparison }` |
| `votes` | `GET /votes` | Community Pick | `{ categories[], userVotes }` |
| `pricing` | `GET /pricing` | Pricing cards | `Product[]` |
| `quoteOptions` | `GET /quote-options` | Quote Builder | `{ placements, durations, audiences, extras, defaults }` |
| `faqs` | `GET /faqs` | FAQ | `{ question, answer }[]` |
| `brandProfile` | `GET /brand-profile` | Brand Panel, How it works | `{ name, pitch, email, contactName, phone, location, region, stats }` |
| `waitlistOptions` | `GET /waitlist/options` | Join form | `{ roles[], perks[] }` |
| `requestQuote` | `POST /quotes` | "Request quote" | `{ reference, … }` |
| `saveBrandProfile` | `PUT /brand-profile` | "Save and update everywhere" | the saved profile |
| `castVote` | `POST /votes` | Vote buttons | same shape as `GET /votes` |
| `joinWaitlist` | `POST /waitlist` | Join form | `{ ok }` |
| `recordContactView` | `POST /brands/:brandId/contact-views` | "Show contact" | `{ ok }` (fire-and-forget) |

Banners from the API can be plain images. A featured slide with `imageUrl` and the hero `preview.imageUrl` render as images, with a working "See contact" button laid over them.

---

## How data flows

```
component
   │  useApiQuery('brands')            reads: loading / error / retry / polling / shared cache
   │  useApiMutation('castVote')       writes: loading / error
   ▼
src/services/api.js  →  callApi(name, params)
   ├─ demo?  → src/services/demo/demoApi.js  → src/demo-data/*
   └─ live?  → src/services/apiClient.js     → fetch(baseUrl + path)
                    → src/services/adapters.js (reshape response)
```

- Components never import data directly. They only name an endpoint.
- Components that ask for the same endpoint and parameters share a single request. For example, `/slots` feeds the Banner Board, the Quote Builder and How it works, and is fetched once.
- Every section has a loading skeleton and an error message with **Try again**. One failing endpoint never breaks the rest of the page.
- Live sections keep the previous numbers on screen (dimmed) while a new market loads, and polling pauses while the browser tab is hidden or the section is off-screen.
- Votes update optimistically: the ranking moves instantly and rolls back if the save fails.

---

## Testing

### Against a local mock API

This tests the real HTTP path without a backend:

```bash
npm run mock-api                              # terminal 1: http://localhost:8787
```

```env
# .env
VITE_API_BASE_URL=http://localhost:8787
VITE_USE_DEMO_DATA=false
```

```bash
npm run dev                                   # terminal 2
```

To check error handling, make some endpoints fail:

```bash
FAIL=faqs,pricing npm run mock-api            # those return HTTP 500
```

### Checks run on this build

- **49 interaction checks** (navigation, filters, search, voting, forms, quote maths, modals, persistence, mobile menu) pass in both **demo mode** and **real-API mode** against the mock server, with no console errors.
- In real-API mode, all 17 endpoints were called over HTTP.
- **Failures:** with three endpoints returning HTTP 500, each of those sections showed its own error while the rest of the page kept working. "Try again" recovered them. With the server completely down, the page showed per-section errors and did not crash.

---

## Project structure

```
src/
  config/
    api.config.js       ← THE file to edit: base URL, endpoints, polling, auth
    navigation.js       Navbar and footer links (UI config)
    steps.js            "How it works" step labels (UI config)
    filters.js          Filter and sort tab options (UI config)
  demo-data/            All placeholder content; one file per endpoint
  services/
    api.js              callApi(): routes each endpoint to demo or live
    apiClient.js        fetch wrapper: base URL, auth, timeout, errors
    adapters.js         Reshape API responses (edit here if shapes differ)
    queryStore.js       Shared cache behind useApiQuery
    demo/demoApi.js     Stand-in backend serving demo-data (with live simulation)
  hooks/
    useApiQuery.js      Read hook: data, isLoading, error, refetch, polling
    useApiMutation.js   Write hook: mutate, isLoading, error
    …                   useCountUp, useInView, useScrollSpy, useFlipList…
  components/
    layout/             Navbar, Footer
    sections/           One component per page section
    modals/             ContactModal, QuoteRequestModal
    ui/                 Button, Badge, Field, Modal, AsyncState (skeleton/error)…
  context/              Settings (theme, currency, rates), Quote (catalog + builder state), UI (toasts, contact card)
  utils/                quote maths, currency, dates, slots, validation…
scripts/
  mock-api.mjs          Local mock REST API (npm run mock-api)
```

Marketing copy (section headings and descriptions) stays in the components. If you later want that editable too, add an endpoint and follow the same pattern.

---

## Tech stack

React 18.3.1 · Vite 5.4.11 · Tailwind CSS 3.4.17 · lucide-react 0.468.0 · self-hosted fonts via @fontsource (Manrope, Poppins, Lora). Every dependency is pinned to an exact version. No data-fetching library is needed: the small query layer in `src/services` covers caching, polling and retries.

## Design notes

- The layout follows the PDF at 1920px.
- The "How it works" right panel and the badges were measured against the Figma and match it within 1px.
- In the Banner Board, the inspector card stretches to the board's height.
- Light and dark themes are supported via CSS variables in `src/styles/index.css`.
- The layout is responsive from 390px phones to 1920px desktops, with no horizontal overflow.

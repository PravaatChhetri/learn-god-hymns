# Hanuman Chalisa, Bajrang Baan & Ram Stuti — English

A single-page web app for reading, learning and reciting three devotional Hindu texts in English transliteration with plain-English meaning: **Ram Stuti**, **Hanuman Chalisa**, and **Bajrang Baan**. Built with Next.js and deployed on Vercel, with one API route for the collective count.


## Features

- **Three texts, swipeable stanza cards** — Ram Stuti, Hanuman Chalisa and Bajrang Baan, each broken into individual dohas/chaupais/invocations. Navigate with swipe gestures, on-screen arrows, or the left/right arrow keys.
- **Translation toggle** — show or hide the plain-English meaning of the current stanza.
- **Learn mode** — guided, line-by-line recitation help for the active stanza:
  - On the **Chalisa** tab, Learn plays a real chant recording (via an embedded, hidden YouTube player) seeked to that verse's position, and highlights each line in time with the audio.
  - On the **Ram Stuti** and **Bajrang Baan** tabs (and as a fallback if the YouTube player can't load), Learn uses the browser's built-in text-to-speech (`speechSynthesis`) to read each line aloud, with a soft generated ambient drone underneath.
  - A speed selector (0.5x–1.5x) controls playback rate for both the YouTube audio and the text-to-speech voice.
- **Reading counter (japa count)** — completing a full pass through a text (reaching the end and wrapping back to the start, or tapping "Mark complete") increments a private counter for that text, shown via a badge and a details sheet. Personal counts are stored in the browser (`localStorage`). Each completion also adds an anonymous +1 to the collective total (see below).
- **Home: the collective offering.** The default landing view shows the total naam jap, Chalisa, Ram Stuti and Bajrang Baan completed by everyone. 108 beads light up as the current collective mala fills. Tap the ॐ to return to it. Below the count, the home page also holds the site introduction, the three prayers, how to practise, chant-audio credits and the about note.
- **Per-text reading position** — your current stanza in each text is remembered across visits.
- **Theming** — each text has its own accent color/background gradient, switched via a `data-theme` attribute on `<body>`.
- **SEO / GEO metadata** — Open Graph, Twitter Card, and JSON-LD structured data (`WebSite`, `CreativeWork` x3, `FAQPage`) for search engines and AI answer engines.

## Pages

| URL | Page |
| --- | --- |
| `/` | Home: collective count, the three prayers, how to practise, chant voices, about |
| `/ram-stuti` | Ram Stuti reader |
| `/hanuman-chalisa` | Hanuman Chalisa reader |
| `/bajrang-baan` | Bajrang Baan reader |
| `/mala` | Naam jap mala |

Each page is prerendered with its own title, description, canonical URL and JSON-LD. The theme (colours, background) comes from the URL, so it is correct in the server HTML.

## Project structure

```
app/
  layout.tsx          Site metadata, fonts (next/font), <AppProvider> + <Shell>
  page.tsx            Home page (server-rendered sections + JSON-LD)
  [slug]/page.tsx     The three text pages (static params, per-page metadata)
  mala/page.tsx       Mala page
  api/tally/route.ts  Collective count API (Upstash Redis)
  globals.css, robots.ts, sitemap.ts, icon.svg
components/
  AppProvider.tsx     Shared state across pages: counts, positions, mala, Learn, toast
  Shell.tsx           Themed background, top navigation, toast, count sheet
  Reader.tsx          Stanza cards, swipe/keys, Translation / Learn / speed / Mark complete
  MalaView.tsx        Naam jap mala strand
  CountSheet.tsx      Personal reading counts
  home/CollectiveOffering.tsx  Live totals + 108-bead ring
  home/Lotus.tsx      Ornamental divider
hooks/useLearn.ts     Learn mode: hidden YouTube chant player, text-to-speech fallback, drone
lib/
  texts.ts            Text content (typed)
  routes.ts           Page slugs, Devanagari names, per-page SEO copy, theme-for-URL
  tally.ts            Browser queue + store for the collective count
  tally-fields.ts     Fields and per-request limits shared by client and API
  mala.ts, storage.ts, site.ts
public/               bg.jpg, bead artwork
```

## Data model (`lib/texts.ts`)

Each text is an array of stanza objects:

```js
{
  type: "doha" | "chaupai" | "invocation",
  n: 1,                 // verse number, for chaupais
  text: "line one\nline two...",
  meaning: "plain-English meaning of the stanza",
  t: 13                 // Chalisa only: start-second in the reference video
}
```

`TEXTS` maps `ramstuti` / `chalisa` / `bajrangbaan` to `{ id, title, subtitle, stanzas }`, and is what the UI iterates over.

### Chalisa video timestamps

`CHALISA` entries carry a `t` field: the start time (in seconds) of that stanza in the reference recording (*Rasraj Ji Maharaj – Lo-fi Version Shree Hanuman Chalisa*, video ID `BLlTFapgvOo`). A stanza's *end* time is simply the next stanza's `t` (the last stanza uses `CHALISA_END_T`, defined in `lib/texts.ts`). Within a stanza, individual lines are highlighted at evenly-spaced offsets across that window, since only per-verse (not per-line) timing data is available — so line-level sync is an approximation, while verse-level sync is exact.

## How Learn mode works (`hooks/useLearn.ts`)

- `startLearn(stanza, cardEl)` is the entry point (wired to both the footer Learn button and each card's own Learn button).
  - If the active tab is Chalisa, the YouTube player has finished initializing, and the stanza has a `t` timestamp → `startLearnYouTube()` runs.
  - Otherwise → the text-to-speech path runs.
- `startLearnYouTube()` seeks the hidden YouTube player to the stanza's timestamp, sets the chosen playback rate, plays it, and schedules `setTimeout` calls to move the "active" highlight across the stanza's lines, finishing with an automatic `stopLearn()` at the stanza's end boundary.
- The text-to-speech path builds one `SpeechSynthesisUtterance` per line, highlighting each as it's spoken, and chains to the next line on `onend`/`onerror`.
- `stopLearn()` is the single teardown path: cancels speech synthesis, pauses the YouTube player, clears any pending timers, stops the ambient drone, and resets the Learn button UI. It's called automatically on stanza navigation, tab switching, and reaching the end of a stanza.
- A `learnToken` counter guards against stale async callbacks (a delayed `speechSynthesis` event or `setTimeout` from a previous stanza) acting after the user has already moved on.

The YouTube player itself is mounted invisibly (`#ytPlayerMount`, 1×1px, `opacity: 0`) — only its audio is used, never its video.

## Storage (all `localStorage`, all client-side only)

| Key | Purpose |
| --- | --- |
| `hanuman-app:counts:v1` | Completed-reading count per text |
| `hanuman-app:pos:v1` | Last-viewed stanza index per text |
| `hanuman-app:speed:v1` | Chosen Learn playback rate |
| `hanuman-app:mala:v1` | Mala bead / mala count |
| `hanuman-app:pending:v1` | Collective increments not yet sent |
| `hanuman-app:global:v1` | Last collective totals seen, shown while offline |

## Collective count (`app/api/tally/route.ts`)

`GET /api/tally` returns `{ naamjap, chalisa, ramstuti, bajrangbaan }`. `POST /api/tally` takes a JSON body of increments. Totals live in one Upstash Redis hash (`tally:totals`), connected through the Vercel Marketplace (env vars `KV_REST_API_URL` / `KV_REST_API_TOKEN`). Each POST applies its `HINCRBY`s and reads the totals back in one atomic transaction, so concurrent increments are never lost.

The client queues increments in `localStorage` and sends them in batches: 4 s after the last change, via `sendBeacon` when the page is hidden, and on the next visit if the device was offline. A single request can add at most 1080 names and 5 of each path. Only numbers are stored, with no IP or user identifier. There is no auth, so a determined person could still inflate the totals by scripting requests.

Without the Redis env vars, `next dev` counts in memory (reset on restart). Run `vercel env pull .env.local` to develop against the real database.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
```

## Deploying

Hosted on Vercel (project `learn-god-hymns`, connected to the GitHub repo, so pushes to `main` deploy to production). Functions and the Redis database both run in Mumbai (`bom1`, see `vercel.json`). Manual deploy: `vercel deploy --prod`.

Canonical URLs use `NEXT_PUBLIC_SITE_URL` when set (e.g. once a custom domain is added), otherwise the project's Vercel production domain.

## Browser support notes

- Learn mode's text-to-speech path requires `window.speechSynthesis` (most modern desktop and mobile browsers; not all embedded WebViews).
- Learn mode's YouTube path requires network access to `youtube.com` and a browser that allows the IFrame API to load; if it fails to load, Learn transparently falls back to text-to-speech with no user-facing error.
- Swipe gestures use the Pointer Events API.

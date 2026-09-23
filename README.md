# Hanuman Chalisa, Bajrang Baan & Ram Stuti — English

A single-page web app for reading, learning and reciting three devotional Hindu texts in English transliteration with plain-English meaning: **Ram Stuti**, **Hanuman Chalisa**, and **Bajrang Baan**. Built as a static site (no build step, no backend) — open `index.html` or deploy the folder as-is.

Live at: https://hanuman-chalisa-app-jerq.netlify.app/

## Features

- **Three texts, swipeable stanza cards** — Ram Stuti, Hanuman Chalisa and Bajrang Baan, each broken into individual dohas/chaupais/invocations. Navigate with swipe gestures, on-screen arrows, or the left/right arrow keys.
- **Translation toggle** — show or hide the plain-English meaning of the current stanza.
- **Learn mode** — guided, line-by-line recitation help for the active stanza:
  - On the **Chalisa** tab, Learn plays a real chant recording (via an embedded, hidden YouTube player) seeked to that verse's position, and highlights each line in time with the audio.
  - On the **Ram Stuti** and **Bajrang Baan** tabs (and as a fallback if the YouTube player can't load), Learn uses the browser's built-in text-to-speech (`speechSynthesis`) to read each line aloud, with a soft generated ambient drone underneath.
  - A speed selector (0.5x–1.5x) controls playback rate for both the YouTube audio and the text-to-speech voice.
- **Reading counter (japa count)** — completing a full pass through a text (reaching the end and wrapping back to the start, or tapping "Mark complete") increments a private counter for that text, shown via a badge and a details sheet. Counts are stored only in the browser (`localStorage`) — nothing is sent to a server.
- **Per-text reading position** — your current stanza in each text is remembered across visits.
- **Intro / about overlay** — a welcome screen with an FAQ and background on the project, shown once per browser (or reopened anytime via the info button).
- **Theming** — each text has its own accent color/background gradient, switched via a `data-theme` attribute on `<body>`.
- **SEO / GEO metadata** — Open Graph, Twitter Card, and JSON-LD structured data (`WebSite`, `CreativeWork` x3, `FAQPage`) for search engines and AI answer engines.

## File structure

```
index.html    Markup: intro overlay, app shell, stanza card container, footer controls, count sheet
style.css     All styling, including per-text theme variables and the Learn/speed controls
data.js       Text content: RAM_STUTI, CHALISA, BAJRANG_BAAN arrays + the TEXTS lookup object
app.js        All application logic (single IIFE, no dependencies/framework)
robots.txt    Search engine crawl rules
sitemap.xml   Sitemap for search engines
bg.jpg        Background artwork
```

There is no build tool, package manager, or bundler — `data.js` and `app.js` are loaded directly as plain `<script>` tags, plus the YouTube IFrame API script (`https://www.youtube.com/iframe_api`).

## Data model (`data.js`)

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

`CHALISA` entries carry a `t` field: the start time (in seconds) of that stanza in the reference recording (*Rasraj Ji Maharaj – Lo-fi Version Shree Hanuman Chalisa*, video ID `BLlTFapgvOo`). A stanza's *end* time is simply the next stanza's `t` (the last stanza uses `CHALISA_END_T`, defined in `data.js`). Within a stanza, individual lines are highlighted at evenly-spaced offsets across that window, since only per-verse (not per-line) timing data is available — so line-level sync is an approximation, while verse-level sync is exact.

## How Learn mode works (`app.js`)

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
| `hanuman-app:lasttext:v1` | Last-viewed tab |
| `hanuman-app:seenintro:v1` | Whether the intro overlay has been dismissed |
| `hanuman-app:speed:v1` | Chosen Learn playback rate |

Nothing is sent to a server; there is no backend, analytics, or tracking beyond what's declared in the meta tags for search engines.

## Running locally

No build step required. Serve the folder with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000/`.

## Browser support notes

- Learn mode's text-to-speech path requires `window.speechSynthesis` (most modern desktop and mobile browsers; not all embedded WebViews).
- Learn mode's YouTube path requires network access to `youtube.com` and a browser that allows the IFrame API to load; if it fails to load, Learn transparently falls back to text-to-speech with no user-facing error.
- Swipe gestures use the Pointer Events API.

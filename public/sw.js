// Service worker: once the site has loaded once, it opens and works with no connection.
//
// - On install, every page is fetched and saved, along with every script, stylesheet and font
//   those pages use (found by scanning their HTML and CSS) and the background images.
// - Pages: network first, so updates show up straight away; offline (or a stalled network
//   after a few seconds) the saved copy is served instead.
// - /_next/static files have content hashes in their names, so a saved copy is always right.
// - /api/* (the collective tally) is never cached: the app queues counts in IndexedDB itself
//   and pushes them when the connection returns.
// - RSC requests (client-side navigation data) are left alone. When one fails offline, Next.js
//   falls back to a normal page load, which is then served from the saved pages.
//
// The app registers this file as /sw.js?v=<build>, so every deploy installs a fresh copy.

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;

// keep in sync with lib/routes.ts
const PAGE_URLS = ["/", "/mala", "/ram-stuti", "/hanuman-chalisa", "/bajrang-baan"];
const ASSET_URLS = [
  "/bg.jpg",
  "/bead.webp",
  "/special-bead.webp",
  "/icon.png",
  "/apple-icon.png",
  "/icon-192.png",
  "/favicon.ico",
  "/manifest.webmanifest",
];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, ASSETS]);
      for (const name of await caches.keys()) if (!keep.has(name)) await caches.delete(name);
      await self.clients.claim();
    })(),
  );
});

async function precache() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const found = new Set(ASSET_URLS);

  // save each page and note every build file it references
  // (HTML attributes and the inline RSC payload both name chunks as "/_next/static/...")
  await Promise.allSettled(
    PAGE_URLS.map(async (path) => {
      const res = await fetch(path, { cache: "reload" });
      if (!res.ok || res.redirected) return;
      const html = await res.clone().text();
      await pages.put(path, res);
      for (const m of html.matchAll(/\/_next\/static\/[^"'\s\\)<>]+/g)) found.add(m[0].replace(/&amp;/g, "&"));
    }),
  );

  // stylesheets point at fonts and images of their own
  await Promise.allSettled(
    [...found]
      .filter((u) => new URL(u, self.location.origin).pathname.endsWith(".css"))
      .map(async (u) => {
        const res = await fetch(u, { cache: "reload" });
        if (!res.ok) return;
        const css = await res.clone().text();
        await assets.put(u, res);
        for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
          const ref = new URL(m[1], new URL(u, self.location.origin));
          if (ref.origin === self.location.origin) found.add(ref.pathname + ref.search);
        }
      }),
  );

  await Promise.allSettled(
    [...found].map(async (u) => {
      if (await assets.match(u)) return;
      const res = await fetch(u, { cache: "reload" });
      if (res.ok) await assets.put(u, res);
    }),
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // YouTube etc.: straight to the network
  if (url.pathname.startsWith("/api/")) return;
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (req.mode === "navigate") event.respondWith(page(req, url, event));
  else if (url.pathname.startsWith("/_next/static/")) event.respondWith(cacheFirst(req));
  else event.respondWith(staleWhileRevalidate(req, event));
});

/** Network first with a timeout; the saved copy when offline or the network stalls. */
async function page(req, url, event) {
  const cache = await caches.open(PAGES);
  const key = url.pathname; // ignore ?utm=… and friends
  const network = fetch(req).then(async (res) => {
    if (res.ok && !res.redirected) await cache.put(key, res.clone());
    return res;
  });
  event.waitUntil(network.catch(() => {}));

  const cached = await cache.match(key);
  if (!cached) {
    try {
      return await network;
    } catch {
      return offlineResponse();
    }
  }
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
  try {
    return (await Promise.race([network, timeout])) || cached;
  } catch {
    return cached;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) await cache.put(req, res.clone());
  return res;
}

/** Images, icons, manifest: serve the saved copy at once and refresh it in the background. */
async function staleWhileRevalidate(req, event) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req);
  const network = fetch(req).then(async (res) => {
    if (res.ok) await cache.put(req, res.clone());
    return res;
  });
  if (hit) {
    event.waitUntil(network.catch(() => {}));
    return hit;
  }
  return network;
}

function offlineResponse() {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline</title>
<body style="font-family:Georgia,serif;background:#2a0e0a;color:#fdf3e3;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px">
<div><p style="font-size:40px;margin:0">ॐ</p><p>This page hasn't been saved for offline use yet.</p>
<p><a href="/" style="color:#ffb454">Go to the home page</a></p></div>`,
    { status: 503, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

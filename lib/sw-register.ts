// Register the offline service worker (public/sw.js). Production only: in `next dev` a caching
// worker would serve stale code over hot reloads.
export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  const version = encodeURIComponent(process.env.SW_VERSION ?? "dev");
  // wait for load so precaching doesn't compete with the first page's own downloads
  const register = () =>
    navigator.serviceWorker.register(`/sw.js?v=${version}`, { scope: "/" }).catch(() => {
      /* unsupported or blocked: the site simply needs the network */
    });
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

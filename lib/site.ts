// Canonical site origin, used for canonical URLs, the sitemap and JSON-LD.
// Set NEXT_PUBLIC_SITE_URL once a custom domain exists; otherwise Vercel's production
// domain for the project is used, and localhost in development.
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = siteUrl();

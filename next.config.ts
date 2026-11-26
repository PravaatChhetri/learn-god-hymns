import type { NextConfig } from "next";

// Changes with every deploy, so browsers install a fresh service worker (and fresh offline copies).
const SW_VERSION = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString(36);

const nextConfig: NextConfig = {
  images: {
    // chant-audio thumbnails in the About overlay
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },
  env: { SW_VERSION },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;

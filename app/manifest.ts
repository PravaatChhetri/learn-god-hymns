import type { MetadataRoute } from "next";

// Lets the site be installed to the home screen and open like an app (works offline via /sw.js).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hanuman Chalisa, Bajrang Baan & Ram Stuti",
    short_name: "Hanuman Chalisa",
    description: "Read, learn and chant the Hanuman Chalisa, Bajrang Baan and Ram Stuti, with a japa mala counter.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#2a0e0a",
    theme_color: "#7a1f13",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

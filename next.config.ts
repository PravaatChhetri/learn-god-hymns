import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // chant-audio thumbnails in the About overlay
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },
};

export default nextConfig;

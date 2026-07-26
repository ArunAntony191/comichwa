/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploads.mangadex.org" },
      { protocol: "https", hostname: "*.mangadex.network" },
      { protocol: "https", hostname: "cmdxd98sb0x3yprd.mangadex.network" },
    ],
  },
  // Allow external img tags (since we're using standard <img> not next/image)
  experimental: {},
};

export default nextConfig;

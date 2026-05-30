/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
    ],
  },
  // Workaround for Windows dev cache corruption (Cannot find module './948.js')
  webpack: (config, { dev }) => {
    if (dev) {
      // Windows: stale .next/server chunks cause "Cannot find module './948.js'"
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;


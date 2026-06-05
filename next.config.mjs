/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.magnific.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ieem.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "doanthanhnien.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-i.vtcnews.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "huongnghiepaau.edu.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn2.fptshop.com.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-blog.jobsgo.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hr1tech.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "career.gpo.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yersin.edu.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.careerviet.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bkacad.edu.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgcdn.tapchicongthuong.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.thanhtra.com.vn",
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


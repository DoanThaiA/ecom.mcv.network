const { withSentryConfig } = require("@sentry/nextjs");
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable critical CSS inlining via critters for faster FCP
    optimizeCss: true,
  },
  images: {
    // Enable modern image formats for better compression
    formats: ["image/avif", "image/webp"],
    // Device breakpoints for srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for smaller images (thumbnails, icons)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 80, 100],
    // Cache TTL: 1 week
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.skyweaver.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "**.skyweaver.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "kenh14cdn.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pos.nvncdn.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "mmenu-dev.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media.mmenu.io",
      },
    ],
  },
};

module.exports = withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: process.env.NEXT_PUBLIC_SENTRY_ORG,
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  telemetry: false,
  widenClientFileUpload: true,
});

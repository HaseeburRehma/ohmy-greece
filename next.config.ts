import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy. Next.js injects small inline bootstrap scripts, so
 * script-src needs 'unsafe-inline' unless we switch to per-request nonces
 * (which would make every page dynamic). Everything else is locked to self.
 */
const csp = (extra: { style?: string; font?: string } = {}) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'${extra.style ? ` ${extra.style}` : ""}`,
    "img-src 'self' data: blob:",
    `font-src 'self'${extra.font ? ` ${extra.font}` : ""}`,
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // The brief calls this page ohmygreece.de/franchise; keep that path working here too.
  async redirects() {
    return [{ source: "/franchise", destination: "/", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/((?!email-preview).*)",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp() }],
      },
      {
        // The dev email gallery loads the Google Fonts the templates reference.
        source: "/email-preview",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: csp({ style: "https://fonts.googleapis.com", font: "https://fonts.gstatic.com" }),
          },
        ],
      },
      {
        // ~30 MB films: let browsers and the CDN keep them; the poster revalidates with them.
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

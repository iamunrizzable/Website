/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Content-Security-Policy is set per-request in middleware.js so
  // script-src can use a nonce instead of 'unsafe-inline'.
];

const nextConfig = {
  poweredByHeader: false,
  // @sparticuz/chromium ships a compressed Chromium binary it extracts at
  // runtime relative to its own package directory. Next's default bundling
  // relocates/inlines the module and breaks that path resolution ("input
  // directory .../bin does not exist") — this tells Next to leave both
  // packages unbundled so they're required normally from node_modules.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // serverExternalPackages alone stops the relocation, but Vercel's file
  // tracer still has to be told to actually COPY the binary into the
  // deployed function — otherwise the directory is simply missing at
  // runtime (the exact error we hit). Confirmed against this project's
  // installed next/dist/build/collect-build-traces.js: keys here are
  // glob-matched against each route's normalized path with `contains: true`
  // (substring match), so a plain route path is enough — no `/route`
  // suffix, no wildcard needed. Every route that (transitively) imports
  // lib/tiktok/browser.js needs an entry.
  outputFileTracingIncludes: {
    '/api/admin/debug-profile': ['./node_modules/@sparticuz/chromium/**'],
    '/api/cron/process-blocks': ['./node_modules/@sparticuz/chromium/**'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // The TikTok agency pages moved from /tiktok/agency/* to
  // /agencies/tiktok/* when the /agencies hub was added. The old URLs are
  // in TikTok bios and DMs in the wild, so keep them working permanently.
  async redirects() {
    return [
      { source: '/tiktok/agency', destination: '/agencies/tiktok', permanent: true },
      { source: '/tiktok/agency/:path*', destination: '/agencies/tiktok/:path*', permanent: true },
      { source: '/agencies/c2/agency-agreement', destination: '/legal/agencies/agreements/c2', permanent: true },
      { source: '/agencies/c2/streaming-basics', destination: '/agencies/c2/streaming/basics', permanent: true },
      { source: '/agencies/c2/join', destination: '/agencies/c2/about', permanent: true },
      { source: '/agencies/tiktok/streaming-basics', destination: '/agencies/tiktok/streaming/basics', permanent: true },
      { source: '/legal/policies-and-procedures', destination: '/legal/policies/and/procedures', permanent: true },
      { source: '/legal/privacy-policy', destination: '/legal/privacy/policy', permanent: true },
      { source: '/legal/hallie-tiktok-moderation-system', destination: '/legal/hallie/tiktok/moderation/system', permanent: true },
    ];
  },
};

module.exports = nextConfig;

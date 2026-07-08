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
  // packages unbundled or so they're required normally from node_modules.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;

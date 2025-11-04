/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['bignumber.js'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.leapwallet.io',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'xdefi-static.s3.eu-west-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'i.stargaze-apis.com',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)?',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, s-maxage=600, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=600, s-maxage=600, must-revalidate',
          },
          {
            key: 'Expires',
            value: '01',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      // Rewrite vault detail pages for bots to SSR endpoint
      {
        source: '/vaults/:vaultAddress/details',
        destination: '/api/ssr/vaults/:vaultAddress',
        has: [
          {
            type: 'header',
            key: 'User-Agent',
            value:
              '(facebook|twitter|linkedin|telegram|discord|bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|TelegramBot|XtilesBot)',
          },
        ],
      },
      // Also handle wallet-prefixed vault URLs for bots
      {
        source: '/wallets/:wallet/vaults/:vaultAddress/details',
        destination: '/api/ssr/vaults/:vaultAddress',
        has: [
          {
            type: 'header',
            key: 'User-Agent',
            value:
              '(facebook|twitter|linkedin|telegram|discord|bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|TelegramBot|XtilesBot)',
          },
        ],
      },
      // Rewrite frontend routes for non-bot user agents (excluding API routes)
      {
        source: '/((?!api|_next|favicon).*)',
        destination: '/',
        has: [
          {
            type: 'header',
            key: 'User-Agent',
            value:
              '(^(?!facebook|twitter|linkedin|telegram|discord|bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|TelegramBot|XtilesBot).*$)',
          },
        ],
      },
    ]
  },
  turbopack: {
    rules: {
      // SVG handling with @svgr/webpack
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveAlias: {
      'utils/charting_library': './src/utils/charting_library/index.js',
    },
  },
}

module.exports = nextConfig

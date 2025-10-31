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
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    // Handle charting library - it's a UMD bundle that needs special treatment
    // Use path.resolve instead of require.resolve to avoid issues when file doesn't exist yet
    const path = require('path')
    const fs = require('fs')
    const chartingLibraryPath = path.resolve(__dirname, 'src/utils/charting_library/index.js')

    // Only add alias if the file exists (it's created by install-charting-library script)
    if (fs.existsSync(chartingLibraryPath)) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'utils/charting_library': chartingLibraryPath,
      }
    }

    // Fix for packages with only "exports" field (like @cosmjs)
    // This ensures webpack can resolve them properly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      ...config.resolve.extensionAlias,
    }

    return config
  },
}

module.exports = nextConfig

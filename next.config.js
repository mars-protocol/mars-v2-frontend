/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
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
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
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
      {
        source: '/:path*',
        destination: '/',
        has: [
          {
            type: 'header',
            key: 'User-Agent',
            value:
              '(^(?!facebook|twitter|linkedin|telegram|discord|bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|TelegramBot).*$)',
          },
        ],
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

module.exports = nextConfig

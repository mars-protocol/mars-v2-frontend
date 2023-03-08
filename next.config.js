/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/trade',
        permanent: true,
      },
      {
        source: '/wallets',
        destination: '/trade',
        permanent: true,
      },
      {
        source: '/wallets/:wallet',
        destination: '/wallets/:wallet/trade',
        permanent: true,
      },
      {
        source: '/wallets/:wallet/accounts',
        destination: '/wallets/:wallet/accounts/trade',
        permanent: true,
      },
    ]
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'utf-8-validate': false,
        bufferutil: false,
        './build/Release/ecdh': false,
        eccrypto: false,
      }
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = nextConfig

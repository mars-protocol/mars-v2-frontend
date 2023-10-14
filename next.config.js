/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.leapwallet.io',
      'raw.githubusercontent.com',
      'xdefi-static.s3.eu-west-1.amazonaws.com',
    ],
  },
  async redirects() {
    return [
      {
        source: '/((?!_next|mobile).*)',
        has: [
          {
            type: 'header',
            key: 'User-Agent',
            value: '.*(Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop).*',
          },
        ],
        permanent: true,
        destination: '/mobile',
      },
    ]
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
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: new Date().toString(),
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
        source: '/:any*',
        destination: '/',
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

// const nodeExternals = require('webpack-node-externals');

/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true
  },
  reactStrictMode: true,
  sentry: {
    hideSourceMaps: true,
  },
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/trade',
      //   permanent: true,
      // },
    ]
  },
  webpack(config, {isServer}) {

    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, 
        'utf-8-validate': false,
        'bufferutil': false,
        './build/Release/ecdh': false,
        'eccrypto': false
      };
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

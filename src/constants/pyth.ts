export const pythEndpoints = {
  // api: process.env.NEXT_PUBLIC_PYTH_API ?? 'https://hermes.pyth.network/api',
  api: process.env.NEXT_PUBLIC_PYTH_TEST_API ?? 'https://hermes.pyth.network/api',
  candles: 'https://benchmarks.pyth.network/v1/shims/tradingview',
}

export const pythEndpoints = {
  // api: process.env.NEXT_PUBLIC_PYTH_API ?? 'https://hermes.pyth.network/api',
  api:
    process.env.NEXT_PUBLIC_PYTH_API ??
    'https://gateway-lon.liquify.com/api=HERMES1J8SML6CBGD673H9/api',
  candles: 'https://benchmarks.pyth.network/v1/shims/tradingview',
}

interface EnvironmentVariables {
  ADDRESS_ACCOUNT_NFT: string
  ADDRESS_CREDIT_MANAGER: string
  ADDRESS_INCENTIVES: string
  ADDRESS_ORACLE: string
  ADDRESS_PARAMS: string
  ADDRESS_RED_BANK: string
  ADDRESS_SWAPPER: string
  ADDRESS_ZAPPER: string
  CANDLES_ENDPOINT: string
  CHAIN_ID: string
  NETWORK: string
  URL_GQL: string
  URL_REST: string
  URL_RPC: string
  URL_API: string
  URL_APOLLO_APR: string
  WALLETS: string[]
  PYTH_API: string
  MAINNET_REST_API: string
}

export const ENV: EnvironmentVariables = {
  ADDRESS_ACCOUNT_NFT: process.env.NEXT_PUBLIC_ACCOUNT_NFT || '',
  ADDRESS_CREDIT_MANAGER: process.env.NEXT_PUBLIC_CREDIT_MANAGER || '',
  ADDRESS_INCENTIVES: process.env.NEXT_PUBLIC_INCENTIVES || '',
  ADDRESS_ORACLE: process.env.NEXT_PUBLIC_ORACLE || '',
  ADDRESS_PARAMS: process.env.NEXT_PUBLIC_PARAMS || '',
  ADDRESS_RED_BANK: process.env.NEXT_PUBLIC_RED_BANK || '',
  ADDRESS_SWAPPER: process.env.NEXT_PUBLIC_SWAPPER || '',
  ADDRESS_ZAPPER: process.env.NEXT_PUBLIC_ZAPPER || '',
  CANDLES_ENDPOINT: process.env.NEXT_PUBLIC_CANDLES_ENDPOINT || '',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '',
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || '',
  URL_GQL: process.env.NEXT_PUBLIC_GQL || '',
  URL_REST: process.env.NEXT_PUBLIC_REST || '',
  URL_RPC: process.env.NEXT_PUBLIC_RPC || '',
  URL_API: process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
    : process.env.NEXT_PUBLIC_API || '',
  URL_APOLLO_APR: process.env.NEXT_PUBLIC_APOLLO_APR || '',
  WALLETS: process.env.NEXT_PUBLIC_WALLETS?.split(',') || [],
  PYTH_API: process.env.NEXT_PUBLIC_PYTH_API || '',
  MAINNET_REST_API: process.env.NEXT_PUBLIC_MAINNET_REST || '',
}

export const VERCEL_BYPASS = process.env.NEXT_PUBLIC_BYPASS
  ? `?x-vercel-protection-bypass=${process.env.NEXT_PUBLIC_BYPASS}`
  : ''

export const IS_TESTNET = ENV.NETWORK !== 'mainnet'

interface EnvironmentVariables {
  ADDRESS_ACCOUNT_NFT: string | undefined
  ADDRESS_CREDIT_MANAGER: string | undefined
  ADDRESS_INCENTIVES: string | undefined
  ADDRESS_ORACLE: string | undefined
  ADDRESS_RED_BANK: string | undefined
  ADDRESS_SWAPPER: string | undefined
  ADDRESS_ZAPPER: string | undefined
  CHAIN_ID: string | undefined
  NETWORK: string | undefined
  URL_GQL: string | undefined
  URL_REST: string | undefined
  URL_RPC: string | undefined
  URL_API: string | undefined
  WALLETS: string[] | undefined
}

export const ENV: EnvironmentVariables = {
  ADDRESS_ACCOUNT_NFT: process.env.NEXT_PUBLIC_ACCOUNT_NFT,
  ADDRESS_CREDIT_MANAGER: process.env.NEXT_PUBLIC_CREDIT_MANAGER,
  ADDRESS_INCENTIVES: process.env.NEXT_PUBLIC_INCENTIVES,
  ADDRESS_ORACLE: process.env.NEXT_PUBLIC_ORACLE,
  ADDRESS_RED_BANK: process.env.NEXT_PUBLIC_RED_BANK,
  ADDRESS_SWAPPER: process.env.NEXT_PUBLIC_SWAPPER,
  ADDRESS_ZAPPER: process.env.NEXT_PUBLIC_ZAPPER,
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  URL_GQL: process.env.NEXT_PUBLIC_GQL,
  URL_REST: process.env.NEXT_PUBLIC_REST,
  URL_RPC: process.env.NEXT_PUBLIC_RPC,
  URL_API: process.env.NEXT_PUBLIC_VERCEL_URL
    ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL + '/api'
    : process.env.NEXT_PUBLIC_API,
  WALLETS: process.env.NEXT_PUBLIC_WALLETS?.split(','),
}

export const IS_TESTNET = ENV.NETWORK !== 'mainnet'

export const ENV_MISSING_MESSAGE = () => {
  const missing: string[] = []
  Object.keys(ENV).forEach((key) => {
    if (!ENV[key as keyof EnvironmentVariables]) {
      missing.push(key)
    }
  })

  return `Environment variable(s) missing for: ${missing.join(', ')}`
}

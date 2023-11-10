interface EnvironmentVariables {
  ADDRESS_ACCOUNT_NFT: string
  ADDRESS_CREDIT_MANAGER: string
  ADDRESS_INCENTIVES: string
  ADDRESS_ORACLE: string
  ADDRESS_PARAMS: string
  ADDRESS_PYTH: string
  ADDRESS_RED_BANK: string
  ADDRESS_SWAPPER: string
  ADDRESS_ZAPPER: string
  CANDLES_ENDPOINT_THE_GRAPH: string
  CANDLES_ENDPOINT_PYTH: string
  CHAIN_ID: string
  NETWORK: string
  URL_GQL: string
  URL_REST: string
  URL_RPC: string
  URL_VAULT_APR: string
  PYTH_ENDPOINT: string
  MAINNET_REST_API: string
  WALLET_CONNECT_ID: string
}

export const ENV: EnvironmentVariables = {
  ADDRESS_ACCOUNT_NFT: process.env.NEXT_PUBLIC_ACCOUNT_NFT || '',
  ADDRESS_CREDIT_MANAGER: process.env.NEXT_PUBLIC_CREDIT_MANAGER || '',
  ADDRESS_INCENTIVES: process.env.NEXT_PUBLIC_INCENTIVES || '',
  ADDRESS_ORACLE: process.env.NEXT_PUBLIC_ORACLE || '',
  ADDRESS_PARAMS: process.env.NEXT_PUBLIC_PARAMS || '',
  ADDRESS_PYTH: process.env.NEXT_PUBLIC_PYTH || '',
  ADDRESS_RED_BANK: process.env.NEXT_PUBLIC_RED_BANK || '',
  ADDRESS_SWAPPER: process.env.NEXT_PUBLIC_SWAPPER || '',
  ADDRESS_ZAPPER: process.env.NEXT_PUBLIC_ZAPPER || '',
  CANDLES_ENDPOINT_THE_GRAPH: process.env.NEXT_PUBLIC_CANDLES_ENDPOINT_THE_GRAPH || '',
  CANDLES_ENDPOINT_PYTH: process.env.NEXT_PUBLIC_CANDLES_ENDPOINT_PYTH || '',
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '',
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || '',
  URL_GQL: process.env.NEXT_PUBLIC_GQL || '',
  URL_REST: process.env.NEXT_PUBLIC_REST || '',
  URL_RPC: process.env.NEXT_PUBLIC_RPC || '',
  URL_VAULT_APR: process.env.NEXT_PUBLIC_VAULT_APR || '',
  PYTH_ENDPOINT: process.env.NEXT_PUBLIC_PYTH_ENDPOINT || '',
  MAINNET_REST_API: process.env.NEXT_PUBLIC_MAINNET_REST || '',
  WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
}

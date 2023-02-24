export const ADDRESS_ACCOUNT_NFT = process.env.NEXT_PUBLIC_ACCOUNT_NFT
export const ADDRESS_CREDIT_MANAGER = process.env.NEXT_PUBLIC_CREDIT_MANAGER
export const ADDRESS_INCENTIVES = process.env.NEXT_PUBLIC_INCENTIVES
export const ADDRESS_ORACLE = process.env.NEXT_PUBLIC_ORACLE
export const ADDRESS_RED_BANK = process.env.NEXT_PUBLIC_RED_BANK
export const ADDRESS_SWAPPER = process.env.NEXT_PUBLIC_SWAPPER
export const ADDRESS_ZAPPER = process.env.NEXT_PUBLIC_ZAPPER

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK
export const IS_TESTNET = NETWORK !== 'mainnet'
export const URL_GQL = process.env.NEXT_PUBLIC_GQL
export const URL_REST = process.env.NEXT_PUBLIC_REST
export const URL_RPC = process.env.NEXT_PUBLIC_RPC
export const URL_API = process.env.NEXT_PUBLIC_API
export const WALLETS = process.env.NEXT_PUBLIC_WALLETS?.split(',') ?? []

export const ENV_MISSING_MESSAGE = 'Environment variable missing'

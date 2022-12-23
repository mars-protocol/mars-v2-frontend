import { networkConfig } from 'config/osmo-test-4'

export const getTokenSymbol = (denom: string, whitelistedAssets: Asset[]) =>
  whitelistedAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.symbol || ''

export const getTokenDecimals = (denom: string, whitelistedAssets: Asset[]) =>
  whitelistedAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.decimals ||
  6

export const getTokenIcon = (denom: string, whitelistedAssets: Asset[]) =>
  whitelistedAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.logo || ''

export const getTokenInfo = (denom: string, whitelistedAssets: Asset[]) =>
  whitelistedAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase()) ||
  networkConfig.assets.base

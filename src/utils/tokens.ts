import { getBaseAsset } from 'utils/assets'

export const getTokenSymbol = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.symbol || ''

export const getTokenDecimals = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.decimals || 6

export const getTokenIcon = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.logo || ''

export const getTokenInfo = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase()) || getBaseAsset()

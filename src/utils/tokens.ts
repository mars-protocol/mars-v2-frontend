import BigNumber from 'bignumber.js'

import { getBaseAsset } from 'utils/assets'
import { BN } from 'utils/helpers'

export const getTokenSymbol = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.symbol || ''

export const getTokenDecimals = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.decimals || 6

export const getTokenIcon = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.logo || ''

export const getTokenInfo = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase()) || getBaseAsset()

export function getTokenValue(coin: Coin, prices: Coin[]): BigNumber {
  const price = prices.find((price) => price.denom === coin.denom)?.amount || '0'
  return BN(price).times(coin.amount)
}

import BigNumber from 'bignumber.js'

import { BNCoin } from 'types/classes/BNCoin'
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

export function getTokenPrice(denom: string, prices: BNCoin[]): BigNumber {
  const price = prices.find((price) => price.denom === denom)?.amount || '0'
  return BN(price)
}

export function getDebtAmountWithInterest(debt: BigNumber, apr: number) {
  return debt.times(1 + apr / 365 / 24).integerValue()
}

export function getDenomsFromBNCoins(coins: BNCoin[]) {
  return coins.map((coin) => coin.denom)
}
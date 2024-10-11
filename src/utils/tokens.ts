import { BN_ZERO } from 'constants/math'

import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export const getTokenSymbol = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.symbol ?? ''

export const getTokenDecimals = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.decimals ?? 6

export const getTokenIcon = (denom: string, marketAssets: Asset[]) =>
  marketAssets.find((asset) => asset.denom.toLowerCase() === denom.toLowerCase())?.logo ?? ''

export function getTokenPrice(denom: string, assets: Asset[], fallback?: BigNumber): BigNumber {
  const price = assets.find((asset) => asset.denom === denom)?.price?.amount
  if (!price) return fallback ?? BN_ZERO
  return BN(price)
}

export function getDenomsFromBNCoins(coins: BNCoin[]) {
  return coins.map((coin) => coin.denom)
}

export function getDebtAmountWithInterest(debt: BigNumber, apr: number) {
  return debt.times(1 + apr / 365 / 24).integerValue()
}

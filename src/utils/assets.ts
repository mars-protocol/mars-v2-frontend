import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export function getAssetByDenom(denom: string): Asset | undefined {
  return ASSETS.find((asset) => asset.denom === denom)
}

export function getAssetBySymbol(symbol: string) {
  return ASSETS.find((asset) => asset.symbol === symbol)
}

export function getEnabledMarketAssets(): Asset[] {
  return ASSETS.filter((asset) => asset.isEnabled && asset.isMarket)
}

export function getAssetsMustHavePriceInfo(): Asset[] {
  return ASSETS.filter((asset) => (asset.isEnabled && asset.isMarket) || asset.forceFetchPrice)
}

export function getPythAssets(): Asset[] {
  return ASSETS.filter((asset) => !!asset.pythPriceFeedId)
}

export function getBaseAsset() {
  return ASSETS.find((asset) => asset.denom === 'uosmo')!
}

export function getDisplayCurrencies() {
  return ASSETS.filter((asset) => asset.isDisplayCurrency)
}

export function getAllAssets(): Asset[] {
  return ASSETS
}

export function findCoinByDenom(denom: string, coins: BigNumberCoin[]) {
  return coins.find((coin) => coin.denom === denom)
}

export function getLendEnabledAssets() {
  return ASSETS.filter((asset) => asset.isAutoLendEnabled)
}

export function getBorrowEnabledAssets() {
  return ASSETS.filter((asset) => asset.isBorrowEnabled)
}

export function getStakingAssets() {
  return ASSETS.filter((asset) => asset.isStaking)
}

function isAssetPair(assetPair: Asset | AssetPair): assetPair is AssetPair {
  return (<AssetPair>assetPair).buy !== undefined
}

export function sortAssetsOrPairs(
  assets: Asset[] | AssetPair[],
  prices: BNCoin[],
  marketDeposits: BNCoin[],
  balances: BNCoin[],
  baseDenom: string,
): Asset[] | AssetPair[] {
  if (prices.length === 0 || marketDeposits.length === 0) return assets

  return assets.sort((a, b) => {
    const assetA = isAssetPair(a) ? a.buy : a
    const assetB = isAssetPair(b) ? b.buy : b

    const aDenom = assetA.denom
    const bDenom = assetB.denom
    const aBalance = balances?.find(byDenom(aDenom))?.amount ?? BN_ZERO
    const aPrice = prices?.find(byDenom(aDenom))?.amount ?? BN_ZERO
    const bBalance = balances?.find(byDenom(bDenom))?.amount ?? BN_ZERO
    const bPrice = prices?.find(byDenom(bDenom))?.amount ?? BN_ZERO

    const aValue = demagnify(aBalance, assetA) * aPrice.toNumber()
    const bValue = demagnify(bBalance, assetB) * bPrice.toNumber()
    if (aValue > 0 || bValue > 0) return bValue - aValue
    if (aDenom === baseDenom) return -1
    if (bDenom === baseDenom) return 1

    const aMarketDeposit = marketDeposits?.find(byDenom(aDenom))?.amount ?? BN_ZERO
    const bMarketDeposit = marketDeposits?.find(byDenom(bDenom))?.amount ?? BN_ZERO
    const aMarketValue = demagnify(aMarketDeposit, assetA) * aPrice.toNumber()
    const bMarketValue = demagnify(bMarketDeposit, assetB) * bPrice.toNumber()

    return bMarketValue - aMarketValue
  })
}

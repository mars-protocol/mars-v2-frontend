import { BN_ZERO } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'

export function findCoinByDenom(denom: string, coins: BigNumberCoin[]) {
  return coins.find((coin) => coin.denom === denom)
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

import { BN_ZERO } from 'constants/math'
import { priceFeedIDs } from 'constants/pythPriceFeedIDs'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, truncate } from 'utils/formatters'

export function findCoinByDenom(denom: string, coins: BigNumberCoin[]) {
  return coins.find((coin) => coin.denom === denom)
}

function isAssetPair(assetPair: Asset | AssetPair): assetPair is AssetPair {
  return (<AssetPair>assetPair).buy !== undefined
}

export function sortAssetsOrPairs(
  assets: Asset[] | AssetPair[],
  markets: Market[],
  balances: BNCoin[],
  baseDenom: string,
  favoriteAssetsDenoms: string[],
): Asset[] | AssetPair[] {
  if (assets.length === 0 || markets.length === 0) return assets

  return assets.sort((a, b) => {
    const assetA = isAssetPair(a) ? a.buy : a
    const assetB = isAssetPair(b) ? b.buy : b

    if (favoriteAssetsDenoms.includes(assetA.denom) && !favoriteAssetsDenoms.includes(assetB.denom))
      return -1

    const aDenom = assetA.denom
    const bDenom = assetB.denom
    const aBalance = balances?.find(byDenom(aDenom))?.amount ?? BN_ZERO
    const aPrice = assetA.price?.amount ?? BN_ZERO
    const bBalance = balances?.find(byDenom(bDenom))?.amount ?? BN_ZERO
    const bPrice = assetB.price?.amount ?? BN_ZERO

    const aValue = demagnify(aBalance, assetA) * aPrice.toNumber()
    const bValue = demagnify(bBalance, assetB) * bPrice.toNumber()
    if (aValue > 0 || bValue > 0) return bValue - aValue
    if (aDenom === baseDenom) return -1
    if (bDenom === baseDenom) return 1

    const aMarketDeposit =
      markets.find((market) => market.asset.denom === aDenom)?.deposits ?? BN_ZERO
    const bMarketDeposit =
      markets.find((market) => market.asset.denom === bDenom)?.deposits ?? BN_ZERO
    const aMarketValue = demagnify(aMarketDeposit, assetA) * aPrice.toNumber()
    const bMarketValue = demagnify(bMarketDeposit, assetB) * bPrice.toNumber()

    return bMarketValue - aMarketValue
  })
}

export function stringifyDenom(denom: string) {
  return denom.replaceAll('/', '_').replaceAll('.', '')
}

export function getAssetSymbolByDenom(denom: string, assets: Asset[]) {
  const asset = assets.find(byDenom(denom))
  return asset?.symbol ?? getSymbolFromUnknownAssetDenom(denom)
}

export function getSymbolFromUnknownAssetDenom(denom: string) {
  const denomParts = denom.split('/')
  if (denomParts[0] === 'factory') return denomParts[denomParts.length - 1].toUpperCase()
  return 'UNKNOWN'
}

export function getNameFromUnknownAssetDenom(denom: string) {
  const denomParts = denom.split('/')
  if (denomParts[0] === 'factory') return `factory...${denomParts[denomParts.length - 1]}`
  if (denomParts[0] === 'gamm') return `Pool Token #${denomParts[denomParts.length - 1]}`
  return truncate(denom, [3, 6])
}

export function getAssetSymbolFromUnknownAsset(symbol: string) {
  const symbolParts = symbol.split('/')
  if (symbolParts[0] === 'factory') return symbolParts[symbolParts.length - 1]
  if (symbolParts[0] === 'gamm') return `POOL ${symbolParts[symbolParts.length - 1]}`
  if (symbolParts[0] === 'ibc') return truncate(symbol, [3, 6])
  return truncate(symbol, [7, 3])
}

export function handleUnknownAsset(coin: Coin): Asset {
  return {
    denom: coin.denom,
    decimals: 6,
    name: getNameFromUnknownAssetDenom(coin.denom),
    symbol: getSymbolFromUnknownAssetDenom(coin.denom),
  }
}
export function convertAstroportAssetsResponse(data: AstroportAsset[]): Asset[] {
  return data.map((asset) => {
    return {
      denom: asset.denom,
      name: asset.description,
      decimals: asset.decimals,
      symbol: getAssetSymbolFromUnknownAsset(asset.symbol),
      logo: asset.icon ?? null,
      price: asset.priceUSD
        ? BNCoin.fromCoin({ denom: asset.denom, amount: String(asset.priceUSD) })
        : undefined,
      pythPriceFeedId: priceFeedIDs.find((pf) => pf.symbol === asset.symbol.toUpperCase())
        ?.priceFeedID,
      pythFeedName: priceFeedIDs.find((pf) => pf.symbol === asset.symbol.toUpperCase())?.feedName,
    }
  })
}

import { LogoUKNOWN } from 'components/common/assets/AssetLogos'
import { BN_ZERO } from 'constants/math'
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
  prices: BNCoin[],
  markets: Market[],
  balances: BNCoin[],
  baseDenom: string,
): Asset[] | AssetPair[] {
  if (prices.length === 0 || markets.length === 0) return assets

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

    const aMarketDeposit =
      markets.find((market) => market.asset.denom === aDenom)?.deposits ?? BN_ZERO
    const bMarketDeposit =
      markets.find((market) => market.asset.denom === bDenom)?.deposits ?? BN_ZERO
    const aMarketValue = demagnify(aMarketDeposit, assetA) * aPrice.toNumber()
    const bMarketValue = demagnify(bMarketDeposit, assetB) * bPrice.toNumber()

    return bMarketValue - aMarketValue
  })
}

export function getAllAssetsWithPythId(chains: { [key: string]: ChainConfig }) {
  return Object.entries(chains)
    .map(([_, chainConfig]) => chainConfig.assets)
    .flatMap((assets) => assets)
    .filter(
      (item, index, array) =>
        index === array.findIndex((foundItem) => foundItem['denom'] === item['denom']),
    )
    .filter((asset) => asset.pythPriceFeedId)
}

export function getAssetSymbol(chainConfig: ChainConfig, denom: string) {
  return chainConfig.assets.find((asset) => asset.denom === denom)?.symbol
}

export function stringifyDenom(denom: string) {
  return denom.replaceAll('/', '_').replaceAll('.', '')
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
  return symbol
}

export function handleUnknownAsset(coin: Coin): Asset {
  return {
    denom: coin.denom,
    decimals: 6,
    hasOraclePrice: false,
    id: stringifyDenom(coin.denom),
    name: getNameFromUnknownAssetDenom(coin.denom),
    symbol: getSymbolFromUnknownAssetDenom(coin.denom),
  }
}
export function convertAstroportAssetsResponse(data: AstroportAsset[], assets: Asset[]): Asset[] {
  const whitelistedAssetDenoms = assets.map((asset) => asset.denom)
  const astroportAssetData = data.filter((asset) => !whitelistedAssetDenoms.includes(asset.denom))

  return astroportAssetData.map((asset) => {
    return {
      denom: asset.denom,
      decimals: asset.decimals,
      hasOraclePrice: false,
      id: stringifyDenom(asset.symbol),
      name: asset.description,
      symbol: getAssetSymbolFromUnknownAsset(asset.symbol),
      logo: getAstroportAssetLogo(asset.icon),
      isAutoLendEnabled: false,
      isTradeEnabled: true,
      price: asset.priceUSD
        ? BNCoin.fromCoin({ denom: asset.denom, amount: String(asset.priceUSD) })
        : undefined,
    }
  })
}

export function getAstroportAssetLogo(icon?: string) {
  if (!icon) return LogoUKNOWN
  if (icon.startsWith('https://')) return icon
  return `https://app.astroport.fi${icon}`
}

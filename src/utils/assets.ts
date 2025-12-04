import { CAMPAIGNS } from 'constants/campaigns'
import { BN_ZERO } from 'constants/math'
import { priceFeedIDs } from 'constants/pythPriceFeedIDs'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, truncate } from 'utils/formatters'
import { BN } from 'utils/helpers'

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
  favoriteAssetsDenoms: string[],
): Asset[] | AssetPair[] {
  if (assets.length === 0 || markets.length === 0) return assets

  return assets.sort((a, b) => {
    const assetA = isAssetPair(a) ? a.buy : a
    const assetB = isAssetPair(b) ? b.buy : b

    const aDenom = assetA.denom
    const bDenom = assetB.denom
    const aBalance = balances?.find(byDenom(aDenom))?.amount ?? BN_ZERO
    const aPrice = assetA.price?.amount ?? BN_ZERO
    const bBalance = balances?.find(byDenom(bDenom))?.amount ?? BN_ZERO
    const bPrice = assetB.price?.amount ?? BN_ZERO

    const aValue = demagnify(aBalance, assetA) * aPrice.toNumber()
    const bValue = demagnify(bBalance, assetB) * bPrice.toNumber()
    if (aValue > 0 || bValue > 0) return bValue - aValue

    if (favoriteAssetsDenoms.includes(assetA.denom) && !favoriteAssetsDenoms.includes(assetB.denom))
      return -1
    if (!favoriteAssetsDenoms.includes(assetA.denom) && favoriteAssetsDenoms.includes(assetB.denom))
      return 1

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

function getNameFromUnknownAssetDenom(denom: string) {
  const denomParts = denom.split('/')
  if (denomParts[0] === 'factory') return denomParts[denomParts.length - 1]

  if (denomParts[0] === 'gamm') return `Pool Token #${denomParts[denomParts.length - 1]}`
  return truncate(denom, [3, 6])
}

function getAssetNameOrSymbolFromUnknownAsset({
  symbol,
  name,
}: {
  symbol?: string
  name?: string
}) {
  const symbolOrName = symbol ?? name

  if (!symbolOrName) return 'UNKNOWN'
  const symbolParts = symbolOrName.split('/')
  if (symbolOrName === 'Cosmos-Hub Wrapped Bitcoin') return 'Eureka Wrapped Bitcoin'
  if (symbolParts.length === 1 && symbol && symbolOrName.length < 13) return symbol
  if (symbolParts.length === 1 && name && symbolOrName.length < 26) return name
  if (symbolParts[0] === 'factory') return symbolParts[symbolParts.length - 1]
  if (symbolParts[0] === 'ibc') return truncate(symbolOrName, [3, 6])
  return truncate(symbolOrName, [7, 3])
}

export function handleUnknownAsset(coin: Coin): Asset {
  return {
    denom: coin.denom,
    decimals: 6,
    name: getNameFromUnknownAssetDenom(coin.denom),
    symbol: getSymbolFromUnknownAssetDenom(coin.denom),
    campaigns: [],
    chainName: coin.chainName && coin.chainName !== '' ? coin.chainName : undefined,
  }
}
export function convertAstroportAssetsResponse(data: AstroportAsset[]): Asset[] {
  return data.map((asset) => {
    return {
      denom: asset.denom,
      name: getAssetNameOrSymbolFromUnknownAsset({ name: asset.description }),
      decimals: asset.decimals,
      symbol: getAssetNameOrSymbolFromUnknownAsset({ symbol: asset.symbol }),
      logo: asset.icon ?? null,
      price: asset.priceUSD
        ? BNCoin.fromCoin({ denom: asset.denom, amount: String(asset.priceUSD) })
        : undefined,
      pythPriceFeedId: priceFeedIDs.find((pf) => pf.symbol === asset.symbol.toUpperCase())
        ?.priceFeedID,
      pythFeedName: priceFeedIDs.find((pf) => pf.symbol === asset.symbol.toUpperCase())?.feedName,
      campaigns: [],
      isTradeEnabled: BN(asset.totalLiquidityUSD).isGreaterThan(1000),
    }
  })
}

export function resolveAssetCampaigns(
  asset: Asset,
  campaignApys: AssetCampaignApy[],
  chainConfig: ChainConfig,
): AssetCampaign[] {
  const campaign = chainConfig.campaignAssets?.find(byDenom(asset.denom))
  if (!campaign) return []
  const campaignInfos = [] as AssetCampaign[]

  campaign.campaignIds.forEach((campaignId: AssetCampaignId) => {
    const currentCampaign = CAMPAIGNS.find((c) => c.id === campaignId)
    if (!currentCampaign) return

    const campaignInfo = {
      id: currentCampaign.id,
      type: currentCampaign.type,
      name: currentCampaign.name,
      incentiveCopy: currentCampaign.incentiveCopy,
      detailedIncentiveCopy: currentCampaign.detailedIncentiveCopy,
      classNames: currentCampaign.classNames,
      bgClassNames: currentCampaign.bgClassNames,
      tooltip: currentCampaign.tooltip,
      enabledOnV1: currentCampaign.enabledOnV1,
      v1Tooltip: currentCampaign.v1Tooltip ?? '',
      baseMultiplier: 0,
      collateralMultiplier: 0,
      apy: 0,
    }

    if (campaignInfo.type === 'points_with_multiplier' && campaign.baseMultiplier) {
      const multiplierRange = campaign.collateralMultiplier
        ? `${campaign.baseMultiplier}-${campaign.collateralMultiplier}`
        : campaign.baseMultiplier.toString()

      campaignInfo.incentiveCopy = currentCampaign.incentiveCopy.replaceAll(
        '##MULTIPLIER##',
        multiplierRange.toString(),
      )

      campaignInfo.detailedIncentiveCopy = currentCampaign.detailedIncentiveCopy.replaceAll(
        '##MULTIPLIER##',
        multiplierRange.toString(),
      )
      campaignInfo.baseMultiplier = campaign.baseMultiplier
      campaignInfo.collateralMultiplier = campaign.collateralMultiplier ?? campaign.baseMultiplier
    }

    if (campaignInfo.type === 'apy' && campaignApys.length && campaign.campaignDenom) {
      const apy = campaignApys.find(byDenom(campaign.campaignDenom))?.apy || 0
      campaignInfo.incentiveCopy = currentCampaign.incentiveCopy.replaceAll(
        '##APY##',
        apy.toFixed(2) ?? '0',
      )
      campaignInfo.detailedIncentiveCopy = currentCampaign.detailedIncentiveCopy.replaceAll(
        '##APY##',
        apy.toFixed(2) ?? '0',
      )
      campaignInfo.apy = apy
    }

    campaignInfos.push(campaignInfo)
  })

  return campaignInfos
}

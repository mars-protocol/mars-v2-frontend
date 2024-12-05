import getAssetParams from 'api/params/getAssetParams'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'
import { resolveHlsStrategies } from 'utils/resolvers'

export default async function getHlsStakingAssets(
  chainConfig: ChainConfig,
  assets: Asset[],
  markets: Market[],
) {
  const assetParams = await getAssetParams(chainConfig)

  const HlsAssets = assetParams
    .filter((asset) => asset.credit_manager.hls)
    .filter((asset) => {
      const underlyingAsset = assets.find(byDenom(asset.denom))
      if (!underlyingAsset || underlyingAsset.isPoolToken) return
      const correlations = asset.credit_manager.hls?.correlations.filter((correlation) => {
        return 'coin' in correlation
      })
      if (underlyingAsset.isBorrowEnabled) return
      const correlatedAssets = [] as Asset[]
      correlations?.forEach((correlation) => {
        const asset = assets.find(byDenom((correlation as { coin: { denom: string } }).coin.denom))
        if (asset) correlatedAssets.push(asset)
      })

      const filteredAssets = correlatedAssets?.filter((asset) => !asset?.isPoolToken)

      const correlatedDenoms = filteredAssets?.map((asset) => asset?.denom)
      const correlatedAssetParams = assetParams.filter((asset) =>
        correlatedDenoms?.includes(asset.denom),
      )

      return correlatedAssetParams
    })
  const strategies = resolveHlsStrategies('coin', HlsAssets)

  return strategies.map((strategy) => {
    const depositAssetCampaigns = assets.find(byDenom(strategy.denoms.deposit))?.campaigns
    const apy = depositAssetCampaigns?.find((campaign) => campaign.type === 'apy')?.apy ?? 0
    const market = markets.find((market) => market.asset.denom === strategy.denoms.deposit)

    return {
      ...strategy,
      depositCap: {
        denom: strategy.denoms.deposit,
        used: market && market.cap ? market.cap.used : BN_ZERO,
        max: market && market.cap ? market.cap.max : BN_ZERO,
      },
      apy,
    } as HlsStrategy
  })
}

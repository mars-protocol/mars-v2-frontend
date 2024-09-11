import { getParamsQueryClient } from 'api/cosmwasm-client'
import getAssetParams from 'api/params/getAssetParams'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { resolveHlsStrategies } from 'utils/resolvers'

export default async function getHlsStakingAssets(chainConfig: ChainConfig, assets: Asset[]) {
  const assetParams = await getAssetParams(chainConfig)
  const HlsAssets = assetParams
    .filter((asset) => asset.credit_manager.hls)
    .filter((asset) => {
      const underlyingAsset = assets.find(byDenom(asset.denom))
      if (!underlyingAsset) return
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
  const client = await getParamsQueryClient(chainConfig)
  const depositCaps$ = strategies.map((strategy) =>
    client.totalDeposit({ denom: strategy.denoms.deposit }),
  )

  return Promise.all(depositCaps$).then((depositCaps) => {
    return depositCaps.map((depositCap, index) => {
      const depositAssetCampaigns = assets.find(
        byDenom(strategies[index].denoms.deposit),
      )?.campaigns
      const apy = depositAssetCampaigns?.find((campaign) => campaign.type === 'apy')?.apy ?? 0
      return {
        ...strategies[index],
        depositCap: {
          denom: depositCap.denom,
          used: BN(depositCap.amount),
          max: BN(depositCap.cap).times(0.95),
        },
        apy,
      } as HlsStrategy
    })
  })
}

import { getParamsQueryClient } from 'api/cosmwasm-client'
import getAssetParams from 'api/params/getAssetParams'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getHLSStakingAssets(
  chainConfig: ChainConfig,
  assets: Asset[],
  apys: AssetCampaignApy[],
) {
  const stakingAssetDenoms = assets.filter((asset) => asset.isStaking).map((asset) => asset.denom)
  const assetParams = await getAssetParams(chainConfig)
  const HLSAssets = assetParams
    .filter((asset) => asset.credit_manager.hls)
    .filter((asset) => {
      const underlyingAsset = assets.find(byDenom(asset.denom))
      if (!underlyingAsset) return
      const correlations = asset.credit_manager.hls?.correlations.filter((correlation) => {
        return 'coin' in correlation
      })

      const correlatedAssets = [] as Asset[]
      correlations?.forEach((correlation) => {
        const asset = assets.find(byDenom((correlation as { coin: { denom: string } }).coin.denom))
        if (asset) correlatedAssets.push(asset)
      })

      const filteredAssets = correlatedAssets?.filter(
        (asset) => !asset?.isBorrowEnabled && !asset?.isPoolToken && asset.isStaking,
      )

      const correlatedDenoms = filteredAssets?.map((asset) => asset?.denom)

      return stakingAssetDenoms.some((denom) => correlatedDenoms?.includes(denom))
    })
  const strategies = resolveHLSStrategies('coin', HLSAssets)
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
          max: BN(depositCap.cap),
        },
        apy,
      } as HLSStrategy
    })
  })
}

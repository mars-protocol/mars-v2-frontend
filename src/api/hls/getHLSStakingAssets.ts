import { getParamsQueryClient } from 'api/cosmwasm-client'
import getStakingAprs from 'api/hls/getAprs'
import getAssetParams from 'api/params/getAssetParams'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getHLSStakingAssets(chainConfig: ChainConfig) {
  const stakingAssetDenoms = chainConfig.assets
    .filter((asset) => asset.isStaking)
    .map((asset) => asset.denom)
  const assetParams = await getAssetParams(chainConfig)
  const HLSAssets = assetParams
    .filter((asset) => asset.credit_manager.hls)
    .filter((asset) => {
      const correlations = asset.credit_manager.hls?.correlations.filter((correlation) => {
        return 'coin' in correlation
      })

      let correlatedDenoms: string[] | undefined

      correlatedDenoms = correlations
        ?.map((correlation) => (correlation as { coin: { denom: string } }).coin.denom)
        .filter((denoms) => !denoms.includes('gamm/pool/'))

      if (!correlatedDenoms?.length) return false

      return stakingAssetDenoms.some((denom) => correlatedDenoms?.includes(denom))
    })
  const strategies = resolveHLSStrategies('coin', HLSAssets)
  const client = await getParamsQueryClient(chainConfig)
  const depositCaps$ = strategies.map((strategy) =>
    client.totalDeposit({ denom: strategy.denoms.deposit }),
  )

  const aprs = await getStakingAprs(chainConfig.endpoints.aprs.stride)

  return Promise.all(depositCaps$).then((depositCaps) => {
    return depositCaps.map((depositCap, index) => {
      const borrowSymbol = chainConfig.assets.find(byDenom(strategies[index].denoms.borrow))?.symbol
      return {
        ...strategies[index],
        depositCap: {
          denom: depositCap.denom,
          used: BN(depositCap.amount),
          max: BN(depositCap.cap),
        },
        apy: (aprs.find((stakingApr) => stakingApr.denom === borrowSymbol)?.strideYield || 0) * 100,
      } as HLSStrategy
    })
  })
}

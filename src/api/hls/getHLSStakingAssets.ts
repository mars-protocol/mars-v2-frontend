import { getParamsQueryClient } from 'api/cosmwasm-client'
import getStakingAprs from 'api/hls/getAprs'
import getAssetParams from 'api/params/getAssetParams'
import { getAssetByDenom, getStakingAssets } from 'utils/assets'
import { BN } from 'utils/helpers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getHLSStakingAssets() {
  const stakingAssetDenoms = getStakingAssets().map((asset) => asset.denom)
  const assetParams = await getAssetParams()
  const HLSAssets = assetParams
    .filter((asset) => stakingAssetDenoms.includes(asset.denom))
    .filter((asset) => asset.credit_manager.hls)
  const strategies = resolveHLSStrategies('coin', HLSAssets)

  const client = await getParamsQueryClient()
  const depositCaps$ = strategies.map((strategy) =>
    client.totalDeposit({ denom: strategy.denoms.deposit }),
  )

  const aprs = await getStakingAprs()

  return Promise.all(depositCaps$).then((depositCaps) => {
    return depositCaps.map((depositCap, index) => {
      const borrowSymbol = getAssetByDenom(strategies[index].denoms.borrow)?.symbol
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

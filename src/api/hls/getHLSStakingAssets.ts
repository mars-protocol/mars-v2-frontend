import { getParamsQueryClient } from 'api/cosmwasm-client'
import getAssetParams from 'api/params/getAssetParams'
import { BN } from 'utils/helpers'
import { resolveHLSStrategies } from 'utils/resolvers'

export default async function getHLSStakingAssets() {
  const assetParams = await getAssetParams()
  const client = await getParamsQueryClient()
  const HLSAssets = assetParams.filter((asset) => asset.credit_manager.hls)
  const strategies = resolveHLSStrategies('coin', HLSAssets)

  const depositCaps$ = strategies.map((strategy) =>
    client.totalDeposit({ denom: strategy.denoms.deposit }),
  )

  return Promise.all(depositCaps$).then((depositCaps) => {
    return depositCaps.map((depositCap, index) => {
      return {
        ...strategies[index],
        depositCap: {
          denom: depositCap.denom,
          used: BN(depositCap.amount),
          max: BN(depositCap.cap),
        },
      } as HLSStrategy
    })
  })
}

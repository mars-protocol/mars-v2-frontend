import { assetParamsCache, cacheFn } from 'api/cache'
import { getParamsQueryClient } from 'api/cosmwasm-client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getAssetParams(
  chainConfig: ChainConfig,
): Promise<AssetParamsBaseForAddr[]> {
  try {
    return await cacheFn(
      async () => {
        const paramsQueryClient = await getParamsQueryClient(chainConfig.endpoints.rpc)
        return iterateContractQuery(paramsQueryClient.allAssetParams)
      },
      assetParamsCache,
      'assetParams',
      600,
    )
  } catch (ex) {
    throw ex
  }
}

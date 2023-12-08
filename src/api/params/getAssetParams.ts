import { assetParamsCache, cacheFn } from 'api/cache'
import { getParamsQueryClient } from 'api/cosmwasm-client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getAssetParams(): Promise<AssetParamsBaseForAddr[]> {
  try {
    return await cacheFn(
      async () => {
        const paramsQueryClient = await getParamsQueryClient()
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

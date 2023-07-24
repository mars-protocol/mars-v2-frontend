import { getParamsQueryClient } from 'api/cosmwasm-client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'

export default async function getAssetParams(): Promise<AssetParamsBaseForAddr[]> {
  try {
    const paramsQueryClient = await getParamsQueryClient()

    return paramsQueryClient.allAssetParams({})
  } catch (ex) {
    throw ex
  }
}

import { getParamsQueryClient } from 'api/cosmwasm-client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getAssetParams(): Promise<AssetParamsBaseForAddr[]> {
  try {
    const paramsQueryClient = await getParamsQueryClient()
    return iterateContractQuery(paramsQueryClient.allAssetParams)
  } catch (ex) {
    throw ex
  }
}

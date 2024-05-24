import { getParamsQueryClient } from 'api/cosmwasm-client'
import { AssetParamsBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getAssetParams(
  chainConfig: ChainConfig,
): Promise<AssetParamsBaseForAddr[]> {
  const paramsQueryClient = await getParamsQueryClient(chainConfig)
  return await iterateContractQuery(paramsQueryClient.allAssetParams)
}

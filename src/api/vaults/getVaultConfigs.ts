import { getParamsQueryClient } from 'api/cosmwasm-client'
import { VaultConfigBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export const getVaultConfigs = async (
  chainConfig: ChainConfig,
): Promise<VaultConfigBaseForAddr[]> => {
  const paramsQueryClient = await getParamsQueryClient(chainConfig)
  return await iterateContractQuery(paramsQueryClient.allVaultConfigs, 'addr')
}

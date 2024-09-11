import { VaultConfigBaseForAddr } from '../../types/generated/mars-params/MarsParams.types'
import iterateContractQuery from '../../utils/iterateContractQuery'
import { cacheFn, vaultConfigsCache } from '../cache'
import { getParamsQueryClient } from '../cosmwasm-client'

export const getVaultConfigs = async (
  chainConfig: ChainConfig,
): Promise<VaultConfigBaseForAddr[]> => {
  try {
    const paramsQueryClient = await getParamsQueryClient(chainConfig)
    return await cacheFn(
      () => iterateContractQuery(paramsQueryClient.allVaultConfigs, 'addr'),
      vaultConfigsCache,
      `${chainConfig.id}/vaultConfigs`,
      600,
    )
  } catch (ex) {
    console.error(ex)
    return []
  }
}

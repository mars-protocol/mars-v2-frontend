import { VaultUtilizationResponse } from '../../types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultConfigBaseForString } from '../../types/generated/mars-params/MarsParams.types'
import { cacheFn, vaultUtilizationCache } from '../cache'
import { getCreditManagerQueryClient } from '../cosmwasm-client'

export const getVaultUtilizations = async (
  chainConfig: ChainConfig,
  vaultConfigs: VaultConfigBaseForString[],
): Promise<VaultUtilizationResponse[]> => {
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig)
  try {
    const vaultUtilizations$ = vaultConfigs.map((vaultConfig) => {
      return cacheFn(
        () => creditManagerQueryClient.vaultUtilization({ vault: { address: vaultConfig.addr } }),
        vaultUtilizationCache,
        `vaultUtilization/${vaultConfig.addr}`,
        60,
      )
    })

    return await Promise.all(vaultUtilizations$).then((vaultUtilizations) => vaultUtilizations)
  } catch {
    return []
  }
}

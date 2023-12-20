import { cacheFn, vaultUtilizationCache } from 'api/cache'
import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { VaultUtilizationResponse } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'

export const getVaultUtilizations = async (
  chainConfig: ChainConfig,
  vaultConfigs: VaultConfigBaseForString[],
): Promise<VaultUtilizationResponse[]> => {
  const creditManagerQueryClient = await getCreditManagerQueryClient(chainConfig.endpoints.rpc)
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

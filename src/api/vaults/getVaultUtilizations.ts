import { getCreditManagerQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { VaultUtilizationResponse } from 'types/generated/mars-credit-manager/MarsCreditManager.types'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'

export const getVaultUtilizations = async (
  vaultConfigs: VaultConfigBaseForString[],
): Promise<VaultUtilizationResponse[]> => {
  if (!ENV.ADDRESS_PARAMS) return []
  const creditManagerQueryClient = await getCreditManagerQueryClient()
  try {
    const vaultUtilizations$ = vaultConfigs.map((vaultConfig) => {
      return creditManagerQueryClient.vaultUtilization({ vault: { address: vaultConfig.addr } })
    })

    return await Promise.all(vaultUtilizations$).then((vaultUtilizations) => vaultUtilizations)
  } catch {
    return []
  }
}

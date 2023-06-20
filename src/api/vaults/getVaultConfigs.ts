import { getParamsQueryClient } from 'api/cosmwasm-client'
import { ENV } from 'constants/env'
import { VaultConfigBaseForString } from 'types/generated/mars-params/MarsParams.types'

export const getVaultConfigs = async (
  vaultConfigs: VaultConfigBaseForString[],
  startAfter?: string,
): Promise<VaultConfigBaseForString[]> => {
  if (!ENV.ADDRESS_PARAMS) return []
  const paramsQueryClient = await getParamsQueryClient()
  try {
    const batch = await paramsQueryClient.allVaultConfigs({
      limit: 4,
      startAfter,
    })

    vaultConfigs.push(...batch)

    if (batch.length === 4) {
      return await getVaultConfigs(vaultConfigs, batch[batch.length - 1].addr)
    }

    return vaultConfigs
  } catch {
    return vaultConfigs
  }
}

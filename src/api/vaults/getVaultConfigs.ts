import { getParamsQueryClient } from 'api/cosmwasm-client'
import { VaultConfigBaseForAddr } from 'types/generated/mars-params/MarsParams.types'
import iterateContractQuery from 'utils/iterateContractQuery'

export const getVaultConfigs = async (): Promise<VaultConfigBaseForAddr[]> => {
  try {
    const paramsQueryClient = await getParamsQueryClient()
    return await iterateContractQuery(paramsQueryClient.allVaultConfigs, 'addr')
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

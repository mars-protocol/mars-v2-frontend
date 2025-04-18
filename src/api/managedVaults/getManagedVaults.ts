import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'

interface ManagedVaultsResponse {
  data: ManagedVaultsDataResponse[]
  page: number
  limit: number
  total: number
}

export default async function getManagedVaults(chainConfig: ChainConfig, vaultAddress?: string) {
  const defaultReturn = { data: [], page: 1, limit: 5, total: 0 }
  if (!chainConfig.managedVaults || !chainConfig.endpoints.managedVaults) {
    return defaultReturn
  }

  try {
    const url = vaultAddress
      ? `${chainConfig.endpoints.managedVaults}&address=${vaultAddress}`
      : chainConfig.endpoints.managedVaults

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) return defaultReturn
    const data = await response.json()

    console.log('datadatadata', data)
    return data as ManagedVaultsResponse
  } catch (error) {
    console.error('Could not fetch managed vaults.', error)
    return defaultReturn
  }
}

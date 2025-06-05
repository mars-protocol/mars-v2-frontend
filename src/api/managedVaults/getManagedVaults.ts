import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { getUrl } from 'utils/url'

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
    let baseUrl = chainConfig.endpoints.managedVaults
    if (vaultAddress) {
      baseUrl += `&address=${vaultAddress}`
    }
    const url = getUrl(baseUrl, '')
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) return defaultReturn
    const data = await response.json()

    return data as ManagedVaultsResponse
  } catch (error) {
    console.error('Could not fetch managed vaults.', error)
    return defaultReturn
  }
}

import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'

export default async function getHistoricalManagedVaults(
  chainConfig: ChainConfig,
  duration: number,
  vaultAddress: string,
) {
  const defaultReturn: HistoricalManagedVaultsResponse = { data: [], page: 1, limit: 0, total: 0 }
  if (!chainConfig.managedVaults || !chainConfig.endpoints.historicalManagedVaults) {
    return defaultReturn
  }

  try {
    const baseUrl = chainConfig.endpoints.historicalManagedVaults
    if (!baseUrl) return defaultReturn

    const url = `${baseUrl}&duration=${duration}&address=${vaultAddress}`

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)
    const data = await response.json()

    return data as HistoricalManagedVaultsResponse
  } catch (error) {
    console.error('Could not fetch historical vaults data.', error)
    return defaultReturn
  }
}

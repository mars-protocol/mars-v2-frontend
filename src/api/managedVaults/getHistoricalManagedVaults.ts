import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { getUrl } from 'utils/url'

export default async function getHistoricalManagedVaults(
  chainConfig: ChainConfig,
  duration: number | 'all',
  vaultAddress: string,
) {
  const defaultReturn: HistoricalManagedVaultsResponse = { data: [], page: 1, limit: 0, total: 0 }
  if (!chainConfig.managedVaults || !chainConfig.endpoints.historicalManagedVaults) {
    return defaultReturn
  }

  try {
    const url = getUrl(
      duration === 'all'
        ? `${chainConfig.endpoints.historicalManagedVaults}&address=${vaultAddress}`
        : `${chainConfig.endpoints.historicalManagedVaults}&duration=${duration}&address=${vaultAddress}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return defaultReturn
    }
    const data = await response.json()

    return data as HistoricalManagedVaultsResponse
  } catch (error) {
    console.error('Could not fetch historical vaults data.', error)
    return defaultReturn
  }
}

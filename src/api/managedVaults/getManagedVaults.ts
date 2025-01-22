import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'

export default async function getManagedVaults(chainConfig: ChainConfig) {
  if (!chainConfig.managedVaults || !chainConfig.endpoints.managedVaults) {
    return null
  }

  try {
    const response = await fetchWithTimeout(chainConfig.endpoints.managedVaults, FETCH_TIMEOUT)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Could not fetch managed vaults.', error)
  }
}

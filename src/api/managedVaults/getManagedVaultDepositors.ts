import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { getUrl } from 'utils/url'

interface ManagedVaultDepositorsApiResponse {
  denom_owners: ManagedVaultDepositor[]
  pagination: {
    next_key: string | null
    total: string
  }
}

export default async function getManagedVaultDepositors(vaultTokensDenom: string) {
  try {
    const allDepositors: ManagedVaultDepositor[] = []
    let nextKey: string | null = null

    // Loop through all possible pages
    do {
      const baseUrl = `https://neutron-rest.cosmos-apis.com/cosmos/bank/v1beta1/denom_owners_by_query?denom=${vaultTokensDenom}`
      const urlWithPagination = nextKey
        ? `${baseUrl}&pagination.key=${encodeURIComponent(nextKey)}`
        : baseUrl

      const url = getUrl(urlWithPagination, '')
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

      if (!response.ok) {
        return allDepositors
      }

      const data: ManagedVaultDepositorsApiResponse = await response.json()

      allDepositors.push(...data.denom_owners)

      // Update nextKey for the next iteration
      nextKey = data.pagination.next_key
    } while (nextKey !== null)

    return allDepositors
  } catch (error) {
    console.error('Could not fetch managed vault depositors.', error)
    return []
  }
}

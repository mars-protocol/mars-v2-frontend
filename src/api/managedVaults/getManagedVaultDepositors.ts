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
    const baseUrl = `https://neutron-rest.cosmos-apis.com/cosmos/bank/v1beta1/denom_owners_by_query?denom=${vaultTokensDenom}`

    const url = getUrl(baseUrl, '')
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) return []
    const data: ManagedVaultDepositorsApiResponse = await response.json()

    return data.denom_owners
  } catch (error) {
    console.error('Could not fetch managed vault depositors.', error)
    return []
  }
}

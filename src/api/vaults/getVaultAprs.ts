import { aprsCache, cacheFn } from 'api/cache'
import { ENV } from 'constants/env'

export default async function getAprs() {
  try {
    const response = await cacheFn(() => fetch(ENV.URL_VAULT_APR), aprsCache, 'aprs', 60)

    if (response.ok) {
      const data: AprResponse = await response.json()

      return data.vaults.map((aprData) => {
        const finalApr = aprData.apr.projected_apr * 100
        return { address: aprData.address, apr: finalApr } as Apr
      })
    }

    return []
  } catch {
    return []
  }
}

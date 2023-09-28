import { ENV } from 'constants/env'

export default async function getAprs() {
  try {
    const response = await fetch(ENV.URL_VAULT_APR)

    if (response.ok) {
      const data: AprResponse = await response.json()

      const newAprs = data.vaults.map((aprData) => {
        const finalApr = aprData.apr.projected_apr * 100

        return { address: aprData.address, apr: finalApr }
      })

      return newAprs
    }

    return []
  } catch {
    return []
  }
}

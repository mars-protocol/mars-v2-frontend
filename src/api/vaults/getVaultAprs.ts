export default async function getAprs() {
  const APOLLO_URL = 'https://api.apollo.farm/api/vault_infos/v2/osmo-test-5'

  try {
    const response = await fetch(APOLLO_URL)

    if (response.ok) {
      const data: FlatApr[] | NestedApr[] = await response.json()

      const newAprs = data.map((aprData) => {
        try {
          const apr = aprData as FlatApr
          const aprTotal = apr.apr.reduce((prev, curr) => Number(curr.value) + prev, 0)
          const feeTotal = apr.fees.reduce((prev, curr) => Number(curr.value) + prev, 0)

          const finalApr = aprTotal + feeTotal

          return { address: aprData.contract_address, apr: finalApr }
        } catch {
          const apr = aprData as NestedApr
          const aprTotal = apr.apr.aprs.reduce((prev, curr) => Number(curr.value) + prev, 0)
          const feeTotal = apr.apr.fees.reduce((prev, curr) => Number(curr.value) + prev, 0)

          const finalApr = aprTotal + feeTotal
          return { address: aprData.contract_address, apr: finalApr }
        }
      })

      return newAprs
    }

    return []
  } catch {
    return []
  }
}

interface FlatApr {
  contract_address: string
  apr: { type: string; value: number | string }[]
  fees: { type: string; value: number | string }[]
}

interface NestedApr {
  contract_address: string
  apr: {
    aprs: { type: string; value: number | string }[]
    fees: { type: string; value: number | string }[]
  }
}

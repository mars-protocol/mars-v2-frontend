import useSWR from 'swr'

import { FETCH_TIMEOUT } from 'constants/query'
import useChainConfig from 'hooks/chain/useChainConfig'
import { fetchWithTimeout } from 'utils/fetch'
import { convertAprToApy } from 'utils/parsers'

export default function useVaultAprs() {
  const chainConfig = useChainConfig()

  return useSWR(`chains/${chainConfig.id}/vaults/aprs`, () => getAprs(chainConfig), {
    fallbackData: getEmptyAprData(chainConfig),
  })
}

async function getAprs(chainConfig: ChainConfig) {
  if (!chainConfig.farm) return []
  try {
    const response = await fetchWithTimeout(chainConfig.endpoints.aprs.vaults, FETCH_TIMEOUT)

    if (response.ok) {
      const data: AprResponse = await response.json()

      return data.vaults.map((aprData) => {
        const finalApr = aprData.apr.projected_apr * 100
        return {
          address: aprData.address,
          apr: finalApr,
          apy: convertAprToApy(finalApr, 365),
        } as Apr
      })
    }

    return getEmptyAprData(chainConfig, null)
  } catch {
    return getEmptyAprData(chainConfig, null)
  }
}

function getEmptyAprData(chainConfig: ChainConfig, apr?: null) {
  return chainConfig.vaults.map((vault) => ({ address: vault.address, apr: apr, apy: apr }) as Apr)
}

import useSWR from 'swr'

import getPrices from 'api/prices/getPrices'
import useChainConfig from 'hooks/useChainConfig'

export default function usePrices() {
  const chainConfig = useChainConfig()

  return useSWR(`chains/${chainConfig.id}/prices`, () => getPrices(chainConfig), {
    fallbackData: [],
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    keepPreviousData: false,
  })
}

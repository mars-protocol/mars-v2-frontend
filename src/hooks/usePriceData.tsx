import useSWR from 'swr'

import getPricesData from 'api/prices/getPriceData'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function usePricesData() {
  const assets = useStore((s) => s.chainConfig.assets)
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/pricesData`, () => getPricesData(chainConfig, assets), {
    fallbackData: [],
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })
}

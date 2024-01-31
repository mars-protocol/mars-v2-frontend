import useSWR from 'swr'
import getMarkets from 'api/markets/getMarkets'

import useChainConfig from 'hooks/useChainConfig'

export default function useMarketAssets() {
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/markets`, () => getMarkets(chainConfig), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
    keepPreviousData: false,
  })
}

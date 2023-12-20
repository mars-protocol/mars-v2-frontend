import useSWR from 'swr'

import getMarkets from 'api/markets/getMarkets'
import useChainConfig from 'hooks/useChainConfig'

export default function useMarketAssets() {
  const chainConfig = useChainConfig()
  return useSWR(`marketAssets`, () => getMarkets(chainConfig), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}

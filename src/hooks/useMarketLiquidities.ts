import useSWR from 'swr'

import getMarketLiquidities from 'api/markets/getMarketLiquidities'
import useChainConfig from 'hooks/useChainConfig'

export default function useMarketLiquidities() {
  const chainConfig = useChainConfig()
  return useSWR(`marketLiquidities`, () => getMarketLiquidities(chainConfig), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}

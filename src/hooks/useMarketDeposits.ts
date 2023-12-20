import useSWR from 'swr'

import getMarketDeposits from 'api/markets/getMarketDeposits'
import useChainConfig from 'hooks/useChainConfig'

export default function useMarketDeposits() {
  const chainConfig = useChainConfig()
  return useSWR(`marketDeposits`, () => getMarketDeposits(chainConfig), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}

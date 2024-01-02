import useSWR from 'swr'

import getMarketBorrowings from 'api/markets/getMarketBorrowings'
import useChainConfig from 'hooks/useChainConfig'

export default function useMarketBorrowings() {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/markets/borrowings`,
    () => getMarketBorrowings(chainConfig),
    {
      fallbackData: [],
      suspense: false,
      revalidateOnFocus: false,
    },
  )
}

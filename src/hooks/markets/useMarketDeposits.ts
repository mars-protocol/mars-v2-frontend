import useSWR from 'swr'

import getMarketDeposits from 'api/markets/getMarketDeposits'
import useChainConfig from 'hooks/useChainConfig'

export default function useMarketDeposits() {
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/markets/deposits`, () => getMarketDeposits(chainConfig), {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}

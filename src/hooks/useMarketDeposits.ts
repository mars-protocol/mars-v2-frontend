import useSWR from 'swr'

import getMarketDeposits from 'api/markets/getMarketDeposits'

export default function useMarketDeposits() {
  return useSWR(`marketDeposits`, getMarketDeposits, {
    suspense: true,
    fallbackData: [],
  })
}

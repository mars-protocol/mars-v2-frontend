import useSWR from 'swr'

import getMarketBorrowings from 'api/markets/getMarketBorrowings'

export default function useMarketBorrowings() {
  return useSWR(`marketBorrowings`, getMarketBorrowings, {
    suspense: true,
  })
}

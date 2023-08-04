import useSWR from 'swr'

import getMarketBorrowings from 'api/markets/getMarketBorrowings'

export default function useMarketBorrowings() {
  return useSWR(`marketBorrowings`, getMarketBorrowings, {
    fallbackData: [],
    suspense: false,
    revalidateOnFocus: false,
  })
}

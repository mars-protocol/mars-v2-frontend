import useSWR from 'swr'

import getMarkets from 'api/markets/getMarkets'

export default function useMarketAssets() {
  return useSWR(`marketAssets`, getMarkets, {
    suspense: true,
    fallbackData: [],
    revalidateOnFocus: false,
  })
}

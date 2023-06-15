import useSWR from 'swr'

import getMarketLiquidities from 'api/markets/getMarketLiquidities'

export default function useMarketLiquidities() {
  return useSWR(`marketLiquidities`, getMarketLiquidities, {
    suspense: true,
    fallbackData: [],
  })
}

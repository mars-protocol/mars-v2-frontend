import { useMemo } from 'react'

import useMarkets from 'hooks/markets/useMarkets'

export default function useLendingMarkets() {
  const markets = useMarkets()

  return useMemo(() => markets.filter((market) => market.depositEnabled), [markets])
}

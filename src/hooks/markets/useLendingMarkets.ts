import { useMemo } from 'react'

import useMarkets from './useMarkets'

export default function useLendingMarkets() {
  const markets = useMarkets()

  return useMemo(
    () => markets.filter((market) => market.depositEnabled && market.asset.isDepositEnabled),
    [markets],
  )
}

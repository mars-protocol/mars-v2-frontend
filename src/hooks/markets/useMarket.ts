import { useMemo } from 'react'

import useMarkets from 'hooks/markets/useMarkets'

export default function useMarket(denom: string) {
  const markets = useMarkets()

  return useMemo(() => markets.find((market) => market.asset.denom === denom), [denom, markets])
}

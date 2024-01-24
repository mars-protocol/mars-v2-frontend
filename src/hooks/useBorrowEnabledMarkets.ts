import { useMemo } from 'react'

import useMarketAssets from 'hooks/markets/useMarketAssets'

export default function useBorrowEnabledMarkets() {
  const { data: markets } = useMarketAssets()
  return useMemo(() => markets.filter((market) => market.borrowEnabled), [markets])
}

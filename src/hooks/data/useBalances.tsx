import { useEffect, useState } from 'react'

import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useMarkets } from 'hooks/queries/useMarkets'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import { formatBalances } from 'utils/balances'
import useStore from 'store'
import { getMarketAssets } from 'utils/assets'

export const useBalances = () => {
  const [balanceData, setBalanceData] = useState<PositionsData[]>()

  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const selectedAccount = useStore((s) => s.selectedAccount)
  const marketAssets = getMarketAssets()

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  useEffect(() => {
    const balances =
      positionsData?.coins && tokenPrices
        ? formatBalances(positionsData.coins, tokenPrices, false, marketAssets)
        : []
    const debtBalances =
      positionsData?.debts && tokenPrices
        ? formatBalances(positionsData.debts, tokenPrices, true, marketAssets, marketsData)
        : []

    setBalanceData([...balances, ...debtBalances])
  }, [positionsData, marketsData, tokenPrices, marketAssets])

  return balanceData
}

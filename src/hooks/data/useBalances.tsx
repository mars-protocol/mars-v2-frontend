import { useEffect, useState } from 'react'

import { useCreditAccountPositions, useMarkets, useTokenPrices } from 'hooks/queries'
import { useAccountDetailsStore } from 'stores'
import { formatBalances } from 'utils/balances'

export const useBalances = () => {
  const [balanceData, setBalanceData] = useState<PositionsData[]>()

  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  useEffect(() => {
    const balances =
      positionsData?.coins && tokenPrices
        ? formatBalances(positionsData.coins, tokenPrices, false)
        : []
    const debtBalances =
      positionsData?.debts && tokenPrices
        ? formatBalances(positionsData.debts, tokenPrices, true, marketsData)
        : []

    setBalanceData([...balances, ...debtBalances])
  }, [positionsData, marketsData, tokenPrices])

  return balanceData
}

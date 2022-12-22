import { useEffect, useState } from 'react'

import { useCreditAccountPositions, useMarkets, useTokenPrices } from 'hooks/queries'
import { useAccountDetailsStore, useNetworkConfigStore } from 'stores'
import { formatBalances } from 'utils/balances'

export const useBalances = () => {
  const [balanceData, setBalanceData] = useState<PositionsData[]>()

  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const whitelistedAssets = useNetworkConfigStore((s) => s.assets.whitelist)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? '',
  )

  useEffect(() => {
    const balances =
      positionsData?.coins && tokenPrices
        ? formatBalances(positionsData.coins, tokenPrices, false, whitelistedAssets)
        : []
    const debtBalances =
      positionsData?.debts && tokenPrices
        ? formatBalances(positionsData.debts, tokenPrices, true, whitelistedAssets, marketsData)
        : []

    setBalanceData([...balances, ...debtBalances])
  }, [positionsData, marketsData, tokenPrices])

  return balanceData
}

import { useEffect, useState } from 'react'

import { useCreditAccountPositions } from 'hooks/queries/useCreditAccountPositions'
import { useMarkets } from 'hooks/queries/useMarkets'
import { useTokenPrices } from 'hooks/queries/useTokenPrices'
import { useAccountDetailsStore } from 'stores/useAccountDetailsStore'
import { useNetworkConfigStore } from 'stores/useNetworkConfigStore'
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
  }, [positionsData, marketsData, tokenPrices, whitelistedAssets])

  return balanceData
}

import { useMemo } from 'react'

import useCurrentAccountDebts from 'hooks/useCurrentAccountDebts'
import useDepositEnabledMarkets from 'hooks/useDepositEnabledMarkets'
import useMarketBorrowings from 'hooks/useMarketBorrowings'
import useMarketDeposits from 'hooks/useMarketDeposits'
import useMarketLiquidities from 'hooks/useMarketLiquidities'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

export default function useBorrowMarketAssetsTableData(): {
  accountBorrowedAssets: BorrowMarketTableData[]
  availableAssets: BorrowMarketTableData[]
  allAssets: BorrowMarketTableData[]
} {
  const markets = useDepositEnabledMarkets()
  const accountDebts = useCurrentAccountDebts()
  const { data: borrowData } = useMarketBorrowings()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()

  return useMemo(() => {
    const accountBorrowedAssets: BorrowMarketTableData[] = [],
      availableAssets: BorrowMarketTableData[] = []

    markets.forEach(({ denom, liquidityRate, liquidationThreshold, maxLtv }) => {
      const asset = getAssetByDenom(denom) as Asset
      const borrow = borrowData.find((borrow) => borrow.denom === denom)
      const marketDepositAmount = BN(marketDeposits.find(byDenom(denom))?.amount ?? 0)
      const marketLiquidityAmount = BN(marketLiquidities.find(byDenom(denom))?.amount ?? 0)

      const debt = accountDebts?.find((debt) => debt.denom === denom)
      if (!borrow) return

      const borrowMarketAsset: BorrowMarketTableData = {
        ...borrow,
        asset,
        debt: debt?.amount,
        marketDepositAmount,
        marketLiquidityAmount,
        marketLiquidityRate: liquidityRate,
        marketLiquidationThreshold: liquidationThreshold,
        marketMaxLtv: maxLtv,
      }
      ;(borrowMarketAsset.debt ? accountBorrowedAssets : availableAssets).push(borrowMarketAsset)
    })

    return {
      accountBorrowedAssets,
      availableAssets,
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [accountDebts, borrowData, markets, marketDeposits, marketLiquidities])
}

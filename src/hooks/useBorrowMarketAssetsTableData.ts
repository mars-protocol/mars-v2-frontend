import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import useMarketBorrowings from 'hooks/markets/useMarketBorrowings'
import useMarketDeposits from 'hooks/markets/useMarketDeposits'
import useMarketLiquidities from 'hooks/markets/useMarketLiquidities'
import useBorrowEnabledMarkets from 'hooks/useBorrowEnabledMarkets'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default function useBorrowMarketAssetsTableData() {
  const markets = useBorrowEnabledMarkets()
  const account = useCurrentAccount()
  const { data: borrowData } = useMarketBorrowings()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()
  const assets = useAllAssets()

  return useMemo((): {
    accountBorrowedAssets: BorrowMarketTableData[]
    availableAssets: BorrowMarketTableData[]
    allAssets: BorrowMarketTableData[]
  } => {
    const accountBorrowedAssets: BorrowMarketTableData[] = [],
      availableAssets: BorrowMarketTableData[] = []

    markets.forEach(({ denom, apy, ltv }) => {
      const asset = assets.find(byDenom(denom)) as Asset
      const borrow = borrowData.find((borrow) => borrow.denom === denom)
      const marketDepositAmount = BN(marketDeposits.find(byDenom(denom))?.amount ?? 0)
      const marketLiquidityAmount = BN(marketLiquidities.find(byDenom(denom))?.amount ?? 0)

      const debt = account?.debts?.find((debt) => debt.denom === denom)
      if (!borrow) return

      const borrowMarketAsset: BorrowMarketTableData = {
        ...borrow,
        asset,
        debt: debt?.amount,
        marketDepositAmount,
        marketLiquidityAmount,
        apy,
        ltv,
      }
      ;(borrowMarketAsset.debt ? accountBorrowedAssets : availableAssets).push(borrowMarketAsset)
    })

    return {
      accountBorrowedAssets,
      availableAssets,
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [account?.debts, assets, borrowData, marketDeposits, marketLiquidities, markets])
}

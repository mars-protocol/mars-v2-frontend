import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useMarkets from 'hooks/markets/useMarkets'

export default function useBorrowMarketAssetsTableData() {
  const account = useCurrentAccount()
  const markets = useMarkets()

  return useMemo((): {
    accountBorrowedAssets: BorrowMarketTableData[]
    availableAssets: BorrowMarketTableData[]
    allAssets: BorrowMarketTableData[]
  } => {
    const accountBorrowedAssets: BorrowMarketTableData[] = [],
      availableAssets: BorrowMarketTableData[] = []

    markets
      .filter((market) => market.borrowEnabled)
      .forEach((market) => {
        const debt = account?.debts?.find((debt) => debt.denom === market.asset.denom)

        const borrowMarketAsset: BorrowMarketTableData = {
          ...market,
          accountDebt: debt?.amount,
        }
        ;(borrowMarketAsset.accountDebt ? accountBorrowedAssets : availableAssets).push(
          borrowMarketAsset,
        )
      })

    return {
      accountBorrowedAssets,
      availableAssets,
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [account?.debts, markets])
}

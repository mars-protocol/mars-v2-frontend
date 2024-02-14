import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useMarkets from 'hooks/markets/useMarkets'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'

export default function useBorrowMarketAssetsTableData() {
  const account = useCurrentAccount()
  const markets = useMarkets()
  const { convertAmount } = useDisplayCurrencyPrice()

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
        const amount =
          account?.debts?.find((debt) => debt.denom === market.asset.denom)?.amount ?? BN_ZERO
        const value = amount ? convertAmount(market.asset, amount) : undefined

        const borrowMarketAsset: BorrowMarketTableData = {
          ...market,
          accountDebtAmount: amount,
          accountDebtValue: value,
        }
        ;(borrowMarketAsset.accountDebtAmount ? accountBorrowedAssets : availableAssets).push(
          borrowMarketAsset,
        )
      })

    return {
      accountBorrowedAssets,
      availableAssets,
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [account?.debts, markets, convertAmount])
}

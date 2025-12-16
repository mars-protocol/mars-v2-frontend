import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useMarkets from 'hooks/markets/useMarkets'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'
import { useMemo } from 'react'

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
      .filter((market) => {
        // Include markets where borrows are enabled OR where user has active debt
        const hasActiveDebt =
          account?.debts?.find((debt) => debt.denom === market.asset.denom)?.amount?.gt(BN_ZERO) ??
          false
        return market.borrowEnabled || hasActiveDebt
      })
      .forEach((market) => {
        const amount =
          account?.debts?.find((debt) => debt.denom === market.asset.denom)?.amount ?? BN_ZERO
        const value = amount ? convertAmount(market.asset, amount) : undefined

        const borrowMarketAsset: BorrowMarketTableData = {
          ...market,
          accountDebtAmount: amount,
          accountDebtValue: value,
        }

        if (borrowMarketAsset.accountDebtAmount?.isZero()) {
          availableAssets.push(borrowMarketAsset)
        } else {
          accountBorrowedAssets.push(borrowMarketAsset)
        }
      })

    return {
      accountBorrowedAssets,
      availableAssets: availableAssets.filter((a) => !a.asset.isDeprecated),
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [account?.debts, markets, convertAmount])
}

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

        if (borrowMarketAsset.accountDebtAmount?.isZero()) {
          availableAssets.push(borrowMarketAsset)
        } else {
          accountBorrowedAssets.push(borrowMarketAsset)
        }
      })

    return {
      accountBorrowedAssets,
      availableAssets: availableAssets.filter(
        (a) =>
          a.asset.denom !== 'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858',
      ),
      allAssets: [...accountBorrowedAssets, ...availableAssets],
    }
  }, [account?.debts, markets, convertAmount])
}

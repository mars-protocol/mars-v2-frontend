import { BN_ZERO } from 'constants/math'
import useMarkets from 'hooks/markets/useMarkets'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'
import useV1Account from 'hooks/v1/useV1Account'
import { useMemo } from 'react'

export default function useV1BorrowingsTableData() {
  const markets = useMarkets()
  const { data: v1Positions } = useV1Account()
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo((): {
    debtAssets: BorrowMarketTableData[]
  } => {
    const userDebts = v1Positions?.debts ?? []
    const debtAssets: BorrowMarketTableData[] = []

    markets
      .filter((market) => market.borrowEnabled)
      .forEach((market) => {
        const amount =
          userDebts.find((debt) => debt.denom === market.asset.denom)?.amount ?? BN_ZERO
        const value = amount ? convertAmount(market.asset, amount) : undefined
        const borrowMarketAsset: BorrowMarketTableData = {
          ...market,
          accountDebtAmount: amount,
          accountDebtValue: value,
        }
        if (!market.asset.isDeprecated || !value?.isZero()) debtAssets.push(borrowMarketAsset)
      })

    return { debtAssets }
  }, [v1Positions, markets, convertAmount])
}

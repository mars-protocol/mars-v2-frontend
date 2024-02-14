import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useMarkets from 'hooks/markets/useMarkets'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import useV1Positions from 'hooks/v1/useV1Positions'
import useStore from 'store'

export default function useV1BorrowingsTableData() {
  const address = useStore((s) => s.address)
  const markets = useMarkets()
  const { data: v1Positions } = useV1Positions(address)
  const userDebts = v1Positions?.debts ?? []
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo((): {
    debtAssets: BorrowMarketTableData[]
  } => {
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
        debtAssets.push(borrowMarketAsset)
      })

    return { debtAssets }
  }, [userDebts, markets, convertAmount])
}

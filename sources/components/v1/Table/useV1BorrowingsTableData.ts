import { useMemo } from 'react'

import { BN_ZERO } from '../../../constants/math'
import useAccount from '../../../hooks/accounts/useAccount'
import useMarkets from '../../../hooks/markets/useMarkets'
import useDisplayCurrencyPrice from '../../../hooks/prices/useDisplayCurrencyPrice'
import useStore from '../../../store'

export default function useV1BorrowingsTableData() {
  const address = useStore((s) => s.address)
  const markets = useMarkets()
  const { data: v1Positions } = useAccount(address)
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

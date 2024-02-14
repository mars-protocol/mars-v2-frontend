import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useMarkets from 'hooks/markets/useMarkets'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import useV1Positions from 'hooks/v1/useV1Positions'
import useStore from 'store'
import { byDenom } from 'utils/array'

export default function useV1DepositsTableData(): {
  depositAssets: LendingMarketTableData[]
} {
  const address = useStore((s) => s.address)
  const markets = useMarkets()
  const { data: v1Positions } = useV1Positions(address)
  const userCollateral = v1Positions?.lends ?? []
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const depositAssets: LendingMarketTableData[] = []

    markets.forEach((market) => {
      const amount = userCollateral.find(byDenom(market.asset.denom))?.amount ?? BN_ZERO
      const value = amount ? convertAmount(market.asset, amount) : undefined

      const lendingMarketAsset: LendingMarketTableData = {
        ...market,
        accountLentValue: value,
        accountLentAmount: amount,
      }

      depositAssets.push(lendingMarketAsset)
    })

    return {
      depositAssets,
    }
  }, [markets, userCollateral, convertAmount])
}

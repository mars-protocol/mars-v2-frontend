import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAssets from 'hooks/assets/useAssets'
import useLendingMarkets from 'hooks/markets/useLendingMarkets'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'
import useStore from 'store'
import { byDenom } from 'utils/array'

export default function useV1DepositsTableData(): {
  depositAssets: LendingMarketTableData[]
} {
  const address = useStore((s) => s.address)
  const markets = useLendingMarkets()
  const { data: assets } = useAssets()
  const { data: v1Positions } = useAccount(address)
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const depositAssets: LendingMarketTableData[] = []
    const userCollateral = v1Positions?.lends ?? []

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

    userCollateral.forEach((position) => {
      const collateralAsset = assets.find(byDenom(position.denom))
      const collateralMarket = markets.find(byDenom(position.denom))
      if (!collateralAsset || !collateralMarket) return
      if (collateralAsset.isDeprecated) depositAssets.push(collateralMarket)
    })

    return {
      depositAssets,
    }
  }, [markets, v1Positions, convertAmount])
}

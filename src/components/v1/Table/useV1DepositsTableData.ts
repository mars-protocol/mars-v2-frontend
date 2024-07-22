import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useAccount from 'hooks/accounts/useAccount'
import useAssets from 'hooks/assets/useAssets'
import useLendingMarkets from 'hooks/markets/useLendingMarkets'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'

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
      const value = getCoinValue(position, assets)
      if (!collateralAsset) return
      if (collateralAsset.isDeprecated)
        depositAssets.push({
          asset: collateralAsset,
          accountLentValue: value,
          accountLentAmount: position.amount,
          debt: BN_ZERO,
          deposits: position.amount,
          liquidity: position.amount,
          depositEnabled: false,
          borrowEnabled: false,
          apy: {
            borrow: 0,
            deposit: 0,
          },
          ltv: {
            max: 0,
            liq: 0,
          },
        })
    })

    return {
      depositAssets,
    }
  }, [markets, v1Positions, convertAmount])
}

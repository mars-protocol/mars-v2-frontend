import { useMemo } from 'react'

import useCurrentAccountLends from 'hooks/useCurrentAccountLends'
import useDepositEnabledMarkets from 'hooks/useDepositEnabledMarkets'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import useMarketDeposits from 'hooks/useMarketDeposits'
import useMarketLiquidities from 'hooks/useMarketLiquidities'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

function useLendingMarketAssetsTableData(): {
  accountLentAssets: LendingMarketTableData[]
  availableAssets: LendingMarketTableData[]
} {
  const markets = useDepositEnabledMarkets()
  const accountLentAmounts = useCurrentAccountLends()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const accountLentAssets: LendingMarketTableData[] = [],
      availableAssets: LendingMarketTableData[] = []

    markets.forEach(
      ({ denom, cap, liquidityRate, liquidationThreshold, maxLtv, borrowEnabled }) => {
        const asset = getAssetByDenom(denom) as Asset
        const marketDepositAmount = BN(marketDeposits.find(byDenom(denom))?.amount ?? 0)
        const marketLiquidityAmount = BN(marketLiquidities.find(byDenom(denom))?.amount ?? 0)
        const accountLentAmount = accountLentAmounts.find(byDenom(denom))?.amount
        const accountLentValue = accountLentAmount
          ? convertAmount(asset, accountLentAmount)
          : undefined

        const lendingMarketAsset: LendingMarketTableData = {
          asset,
          marketDepositAmount,
          accountLentValue,
          accountLentAmount,
          marketLiquidityAmount,
          marketDepositCap: cap.max,
          marketLiquidityRate: liquidityRate,
          marketLiquidationThreshold: liquidationThreshold,
          marketMaxLtv: maxLtv,
          borrowEnabled,
        }

        ;(lendingMarketAsset.accountLentValue ? accountLentAssets : availableAssets).push(
          lendingMarketAsset,
        )
      },
    )

    return { accountLentAssets, availableAssets }
  }, [markets, marketDeposits, marketLiquidities, accountLentAmounts, convertAmount])
}

export default useLendingMarketAssetsTableData
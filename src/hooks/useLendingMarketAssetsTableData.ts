import { useMemo } from 'react'

import useAllAssets from 'hooks/assets/useAllAssets'
import useMarketDeposits from 'hooks/markets/useMarketDeposits'
import useMarketLiquidities from 'hooks/markets/useMarketLiquidities'
import useCurrentAccountLends from 'hooks/useCurrentAccountLends'
import useDepositEnabledMarkets from 'hooks/useDepositEnabledMarkets'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

function useLendingMarketAssetsTableData(): {
  accountLentAssets: LendingMarketTableData[]
  availableAssets: LendingMarketTableData[]
  allAssets: LendingMarketTableData[]
} {
  const markets = useDepositEnabledMarkets()
  const accountLentAmounts = useCurrentAccountLends()
  const { data: marketLiquidities } = useMarketLiquidities()
  const { data: marketDeposits } = useMarketDeposits()
  const { convertAmount } = useDisplayCurrencyPrice()
  const assets = useAllAssets()

  return useMemo(() => {
    const accountLentAssets: LendingMarketTableData[] = [],
      availableAssets: LendingMarketTableData[] = []

    markets.forEach(({ denom, cap, ltv, apy, borrowEnabled }) => {
      const asset = assets.find(byDenom(denom)) as Asset
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
        apy,
        ltv,
        borrowEnabled,
        cap,
      }

      ;(lendingMarketAsset.accountLentValue ? accountLentAssets : availableAssets).push(
        lendingMarketAsset,
      )
    })

    return {
      accountLentAssets,
      availableAssets,
      allAssets: [...accountLentAssets, ...availableAssets],
    }
  }, [markets, assets, marketDeposits, marketLiquidities, accountLentAmounts, convertAmount])
}

export default useLendingMarketAssetsTableData

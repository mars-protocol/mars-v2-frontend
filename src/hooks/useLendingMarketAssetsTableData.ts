import { useMemo } from 'react'

import { BN } from 'utils/helpers'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import useMarketDeposits from 'hooks/useMarketDeposits'
import useMarketLiquidities from 'hooks/useMarketLiquidities'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import useDepositEnabledMarkets from 'hooks/useDepositEnabledMarkets'
import useCurrentAccountLends from 'hooks/useCurrentAccountLends'

function useLendingMarketAssetsTableData(): {
  accountLentMarkets: LendingMarketTableData[]
  availableMarkets: LendingMarketTableData[]
} {
  const markets = useDepositEnabledMarkets()
  const accountLentAmounts = useCurrentAccountLends()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const accountLentMarkets: LendingMarketTableData[] = [],
      availableMarkets: LendingMarketTableData[] = []

    markets.forEach(({ denom, depositCap, liquidityRate, liquidationThreshold, maxLtv }) => {
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
        marketDepositCap: BN(depositCap),
        marketLiquidityRate: liquidityRate,
        marketLiquidationThreshold: liquidationThreshold,
        marketMaxLtv: maxLtv,
      }

      ;(lendingMarketAsset.accountLentValue ? accountLentMarkets : availableMarkets).push(
        lendingMarketAsset,
      )
    })

    return { accountLentMarkets, availableMarkets }
  }, [markets, marketDeposits, marketLiquidities, accountLentAmounts, convertAmount])
}

export default useLendingMarketAssetsTableData

import { useMemo } from 'react'

import { BN } from 'utils/helpers'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import useMarketDeposits from 'hooks/useMarketDeposits'
import useMarketLiquidities from 'hooks/useMarketLiquidities'
import useDisplayCurrencyPrice from 'hooks/useDisplayCurrencyPrice'
import useDepositEnabledMarkets from 'hooks/useDepositEnabledMarkets'
import useCurrentAccountDeposits from 'hooks/useCurrentAccountDeposits'

function useLendingMarketAssetsTableData(): {
  lentAssets: LendingMarketTableData[]
  availableAssets: LendingMarketTableData[]
} {
  const markets = useDepositEnabledMarkets()
  const accountDeposits = useCurrentAccountDeposits()
  // TODO: replace market deposits with account.lends when credit manager contract has lend feature
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const lentAssets: LendingMarketTableData[] = [],
      availableAssets: LendingMarketTableData[] = []

    markets.forEach(({ denom, depositCap, liquidityRate, liquidationThreshold, maxLtv }) => {
      const asset = getAssetByDenom(denom) as Asset
      const marketDepositAmount = BN(marketDeposits.find(byDenom(denom))?.amount ?? 0)
      const marketLiquidityAmount = BN(marketLiquidities.find(byDenom(denom))?.amount ?? 0)
      const accountDepositAmount = accountDeposits.find(byDenom(denom))?.amount
      const accountDepositValue = accountDepositAmount
        ? convertAmount(asset, accountDepositAmount)
        : undefined

      const lendingMarketAsset: LendingMarketTableData = {
        asset,
        marketDepositAmount,
        accountDepositValue,
        marketLiquidityAmount,
        marketDepositCap: BN(depositCap),
        marketLiquidityRate: liquidityRate,
        marketLiquidationThreshold: liquidationThreshold,
        marketMaxLtv: maxLtv,
      }

      ;(lendingMarketAsset.accountDepositValue ? lentAssets : availableAssets).push(
        lendingMarketAsset,
      )
    })

    return { lentAssets, availableAssets }
  }, [markets, marketDeposits, marketLiquidities, accountDeposits, convertAmount])
}

export default useLendingMarketAssetsTableData

import { useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useLendingMarkets from 'hooks/markets/useLendingMarkets'
import useDisplayCurrencyPrice from 'hooks/prices/useDisplayCurrencyPrice'
import useCurrentAccountLends from 'hooks/wallet/useCurrentAccountLends'
import { byDenom } from 'utils/array'

function useLendingMarketAssetsTableData(): {
  accountLentAssets: LendingMarketTableData[]
  availableAssets: LendingMarketTableData[]
  allAssets: LendingMarketTableData[]
} {
  const markets = useLendingMarkets()
  const accountLentAmounts = useCurrentAccountLends()
  const { convertAmount } = useDisplayCurrencyPrice()

  return useMemo(() => {
    const accountLentAssets: LendingMarketTableData[] = [],
      availableAssets: LendingMarketTableData[] = []

    markets.forEach((market) => {
      const accountLentAmount =
        accountLentAmounts.find(byDenom(market.asset.denom))?.amount ?? BN_ZERO
      const accountLentValue = accountLentAmount
        ? convertAmount(market.asset, accountLentAmount)
        : undefined

      const lendingMarketAsset: LendingMarketTableData = {
        ...market,
        accountLentValue,
        accountLentAmount,
      }

      if (lendingMarketAsset.accountLentAmount?.isZero()) {
        if (!market.asset.isDeprecated) availableAssets.push(lendingMarketAsset)
      } else {
        accountLentAssets.push(lendingMarketAsset)
      }
    })

    return {
      accountLentAssets,
      availableAssets,
      allAssets: [...accountLentAssets, ...availableAssets],
    }
  }, [markets, accountLentAmounts, convertAmount])
}

export default useLendingMarketAssetsTableData

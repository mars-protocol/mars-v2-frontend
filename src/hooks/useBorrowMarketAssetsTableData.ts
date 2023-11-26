import useSWR from 'swr'

import useBorrowEnabledMarkets from 'hooks/useBorrowEnabledMarkets'
import useCurrentAccountDebts from 'hooks/useCurrentAccountDebts'
import useMarketBorrowings from 'hooks/useMarketBorrowings'
import useMarketDeposits from 'hooks/useMarketDeposits'
import useMarketLiquidities from 'hooks/useMarketLiquidities'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { BN } from 'utils/helpers'

export default function useBorrowMarketAssetsTableData(suspense = true) {
  const markets = useBorrowEnabledMarkets()
  const accountDebts = useCurrentAccountDebts()
  const { data: borrowData } = useMarketBorrowings()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: marketLiquidities } = useMarketLiquidities()

  return useSWR(
    'borrowMarketAssetsTableData',
    async (): Promise<{
      accountBorrowedAssets: BorrowMarketTableData[]
      availableAssets: BorrowMarketTableData[]
      allAssets: BorrowMarketTableData[]
    }> => {
      const accountBorrowedAssets: BorrowMarketTableData[] = [],
        availableAssets: BorrowMarketTableData[] = []

      markets.forEach(({ denom, apy, ltv }) => {
        const asset = getAssetByDenom(denom) as Asset
        const borrow = borrowData.find((borrow) => borrow.denom === denom)
        const marketDepositAmount = BN(marketDeposits.find(byDenom(denom))?.amount ?? 0)
        const marketLiquidityAmount = BN(marketLiquidities.find(byDenom(denom))?.amount ?? 0)

        const debt = accountDebts?.find((debt) => debt.denom === denom)
        if (!borrow) return

        const borrowMarketAsset: BorrowMarketTableData = {
          ...borrow,
          asset,
          debt: debt?.amount,
          marketDepositAmount,
          marketLiquidityAmount,
          apy,
          ltv,
        }
        ;(borrowMarketAsset.debt ? accountBorrowedAssets : availableAssets).push(borrowMarketAsset)
      })

      return {
        accountBorrowedAssets,
        availableAssets,
        allAssets: [...accountBorrowedAssets, ...availableAssets],
      }
    },
    {
      suspense,
    },
  )
}

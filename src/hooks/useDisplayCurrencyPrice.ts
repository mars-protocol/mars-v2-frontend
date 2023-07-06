import { useCallback } from 'react'

import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

function useDisplayCurrencyPrice() {
  const { data: prices } = usePrices()
  const displayCurrency = useStore((s) => s.displayCurrency)

  const getConversionRate = useCallback(
    (denom: string) => {
      const assetPrice = prices.find(byDenom(denom))
      const displayCurrencyPrice = prices.find(byDenom(displayCurrency.denom))

      if (assetPrice && displayCurrencyPrice) {
        return BN(assetPrice.amount).dividedBy(displayCurrencyPrice.amount)
      } else {
        throw 'Given denom or display currency price has not found'
      }
    },
    [prices, displayCurrency],
  )

  const convertAmount = useCallback(
    (asset: Asset, amount: string | number | BigNumber) =>
      getConversionRate(asset.denom).multipliedBy(BN(amount).shiftedBy(-asset.decimals)),
    [getConversionRate],
  )

  return {
    getConversionRate,
    convertAmount,
    symbol: displayCurrency.symbol,
  }
}

export default useDisplayCurrencyPrice

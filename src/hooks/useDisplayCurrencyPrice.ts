import { useCallback, useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import usePrices from 'hooks/usePrices'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

function useDisplayCurrencyPrice() {
  const { data: prices } = usePrices()
  const displayCurrencies = useDisplayCurrencyAssets()
  const [displayCurrency] = useDisplayCurrency()

  const displayCurrencyAsset = useMemo(
    () =>
      displayCurrencies.find((asset) => asset.denom === displayCurrency) ?? displayCurrencies[0],
    [displayCurrency, displayCurrencies],
  )

  const getConversionRate = useCallback(
    (denom: string) => {
      const assetPrice = prices.find(byDenom(denom))
      const displayCurrencyPrice = prices.find(byDenom(displayCurrency))

      if (assetPrice && displayCurrencyPrice) {
        return BN(assetPrice.amount).dividedBy(displayCurrencyPrice.amount)
      }

      return BN_ZERO
    },
    [prices, displayCurrency],
  )

  const convertAmount = useCallback(
    (asset: Asset, amount: string | number | BigNumber) => {
      if (!asset) return BN_ZERO

      return (
        getConversionRate(asset.denom)?.multipliedBy(BN(amount).shiftedBy(-asset.decimals)) ??
        BN_ZERO
      )
    },
    [getConversionRate],
  )

  return {
    getConversionRate,
    convertAmount,
    symbol: displayCurrencyAsset?.symbol,
  }
}

export default useDisplayCurrencyPrice

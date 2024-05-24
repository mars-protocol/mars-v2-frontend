import { useCallback, useMemo } from 'react'

import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

function useDisplayCurrencyPrice() {
  const { data: assets } = useAssets()
  const displayCurrencies = useDisplayCurrencyAssets()
  const [displayCurrency] = useDisplayCurrency()

  const displayCurrencyAsset = useMemo(
    () =>
      displayCurrencies.find((asset) => asset.denom === displayCurrency) ?? displayCurrencies[0],
    [displayCurrency, displayCurrencies],
  )

  const getConversionRate = useCallback(
    (denom: string) => {
      const assetPrice = assets.find(byDenom(denom))?.price
      const displayCurrencyPrice = assets.find(byDenom(displayCurrency))?.price

      if (assetPrice && displayCurrencyPrice) {
        return BN(assetPrice.amount).dividedBy(displayCurrencyPrice.amount)
      }

      return BN_ZERO
    },
    [assets, displayCurrency],
  )

  const convertAmount = useCallback(
    (asset: Asset, amount: string | number | BigNumber) => {
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

import { useCallback, useMemo } from 'react'

import useAssets from 'assets/useAssets'
import useDisplayCurrencyAssets from 'assets/useDisplayCurrencyAssets'
import { BN_ZERO } from 'constants/math'
import useDisplayCurrency from 'localStorage/useDisplayCurrency'
import { BN } from 'utils/helpers'
import { getTokenPrice } from 'utils/tokens'

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
      const assetPrice = getTokenPrice(denom, assets)
      const displayCurrencyPrice = getTokenPrice(displayCurrency, assets)

      if (assetPrice && displayCurrencyPrice) {
        return assetPrice.dividedBy(displayCurrencyPrice)
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

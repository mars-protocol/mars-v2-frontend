import { useCallback, useMemo } from 'react'

import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { byDenom } from 'utils/array'
import { getDisplayCurrencies } from 'utils/assets'
import { BN } from 'utils/helpers'

function useDisplayCurrencyPrice() {
  const { data: prices } = usePrices()
  const displayCurrencies = getDisplayCurrencies()
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )

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
    symbol: displayCurrencyAsset?.symbol,
  }
}

export default useDisplayCurrencyPrice

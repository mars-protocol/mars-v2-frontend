import { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getDisplayCurrencies } from 'utils/assets'
import { convertToDisplayAmount } from 'utils/formatters'

interface Props {
  coin: BNCoin
  className?: string
  isApproximation?: boolean
}

export default function DisplayCurrency(props: Props) {
  const displayCurrencies = getDisplayCurrencies()
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const { data: prices } = usePrices()

  const displayCurrencyAsset = useMemo(
    () =>
      displayCurrencies.find((asset) => asset.denom === displayCurrency) ?? displayCurrencies[0],
    [displayCurrency, displayCurrencies],
  )

  return (
    <FormattedNumber
      className={props.className}
      amount={convertToDisplayAmount(props.coin, displayCurrency, prices).toNumber()}
      options={{
        minDecimals: 0,
        maxDecimals: 2,
        abbreviated: true,
        prefix: `${props.isApproximation ? '~ ' : ''}${
          displayCurrencyAsset.prefix ? displayCurrencyAsset.prefix : ''
        }`,
        suffix: displayCurrencyAsset.symbol ? ` ${displayCurrencyAsset.symbol}` : '',
      }}
      animate
    />
  )
}

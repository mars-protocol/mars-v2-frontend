import classNames from 'classnames'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/FormattedNumber'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllAssets from 'hooks/assets/useAllAssets'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  coin: BNCoin
  className?: string
  isApproximation?: boolean
  parentheses?: boolean
  showZero?: boolean
  options?: FormatOptions
}

export default function DisplayCurrency(props: Props) {
  const displayCurrencies = useDisplayCurrencyAssets()
  const assets = useAllAssets()
  const [displayCurrency] = useDisplayCurrency()
  const { data: prices } = usePrices()

  const displayCurrencyAsset = useMemo(
    () =>
      displayCurrencies.find((asset) => asset.denom === displayCurrency) ?? displayCurrencies[0],
    [displayCurrency, displayCurrencies],
  )

  const isUSD = displayCurrencyAsset.id === 'USD'

  const amount = useMemo(() => {
    const coinValue = getCoinValue(props.coin, prices, assets)

    if (displayCurrency === ORACLE_DENOM) return coinValue.toNumber()

    const displayDecimals = displayCurrencyAsset.decimals
    const displayPrice = getCoinValue(
      BNCoin.fromDenomAndBigNumber(displayCurrency, BN(1).shiftedBy(displayDecimals)),
      prices,
      assets,
    )

    return coinValue.div(displayPrice).toNumber()
  }, [assets, displayCurrency, displayCurrencyAsset.decimals, prices, props.coin])

  const isLessThanACent = (isUSD && amount < 0.01 && amount > 0) || (amount === 0 && props.showZero)
  const smallerThanPrefix = isLessThanACent ? '< ' : ''

  const prefix = isUSD
    ? `${props.isApproximation ? '~ ' : smallerThanPrefix}$`
    : `${props.isApproximation ? '~ ' : ''}`
  const suffix = isUSD
    ? ''
    : ` ${displayCurrencyAsset.symbol ? ` ${displayCurrencyAsset.symbol}` : ''}`

  return (
    <FormattedNumber
      className={classNames(
        props.className,
        props.parentheses && 'before:content-["("] after:content-[")"]',
      )}
      amount={isLessThanACent ? 0.01 : amount}
      options={{
        minDecimals: isUSD ? 2 : 0,
        maxDecimals: 2,
        abbreviated: true,
        prefix,
        suffix,
        ...props.options,
      }}
      animate
    />
  )
}

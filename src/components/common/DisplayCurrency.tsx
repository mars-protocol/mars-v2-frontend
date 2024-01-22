import classNames from 'classnames'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
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
  isProfitOrLoss?: boolean
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

  const [amount, absoluteAmount] = useMemo(() => {
    const coinValue = getCoinValue(props.coin, prices, assets)

    if (displayCurrency === ORACLE_DENOM) return [coinValue.toNumber(), coinValue.abs().toNumber()]

    const displayDecimals = displayCurrencyAsset.decimals
    const displayPrice = getCoinValue(
      BNCoin.fromDenomAndBigNumber(displayCurrency, BN(1).shiftedBy(displayDecimals)),
      prices,
      assets,
    )

    const amount = coinValue.div(displayPrice).toNumber()

    return [amount, Math.abs(amount)]
  }, [assets, displayCurrency, displayCurrencyAsset.decimals, prices, props.coin])

  const isLessThanACent = useMemo(
    () => isUSD && absoluteAmount < 0.01 && absoluteAmount > 0,
    [absoluteAmount, isUSD],
  )

  const smallerThanPrefix = isLessThanACent && !props.showZero ? '< ' : ''

  let prefix = isUSD
    ? `${props.isApproximation ? '~ ' : smallerThanPrefix}$`
    : `${props.isApproximation ? '~ ' : ''}`
  const suffix = isUSD
    ? ''
    : ` ${displayCurrencyAsset.symbol ? ` ${displayCurrencyAsset.symbol}` : ''}`

  if (props.options?.prefix && props.options?.prefix !== '$') {
    prefix = `${props.options.prefix}${prefix}`
  }

  return (
    <FormattedNumber
      className={classNames(
        props.className,
        props.parentheses && 'before:content-["("] after:content-[")"]',
        props.isProfitOrLoss && (amount < 0 ? 'text-error' : amount === 0 ? '' : 'text-success'),
        props.isProfitOrLoss && amount < 0 && 'before:content-["-"]',
      )}
      amount={isLessThanACent ? 0.01 : absoluteAmount}
      options={{
        minDecimals: isUSD ? 2 : 0,
        maxDecimals: 2,
        abbreviated: true,
        suffix,
        ...props.options,
        prefix,
      }}
      animate
    />
  )
}

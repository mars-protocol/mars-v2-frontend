import classNames from 'classnames'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import useDisplayCurrencyAssets from 'hooks/assets/useDisplayCurrencyAssets'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import usePrices from 'hooks/prices/usePrices'
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
  showSignPrefix?: boolean
}

export default function DisplayCurrency(props: Props) {
  const {
    coin,
    className,
    isApproximation,
    parentheses,
    showSignPrefix,
    showZero,
    options,
    isProfitOrLoss,
  } = props
  const displayCurrencies = useDisplayCurrencyAssets()
  const assets = useAllWhitelistedAssets()
  const [displayCurrency] = useDisplayCurrency()
  const { data: prices } = usePrices()

  const displayCurrencyAsset = useMemo(
    () =>
      displayCurrencies.find((asset) => asset.denom === displayCurrency) ?? displayCurrencies[0],
    [displayCurrency, displayCurrencies],
  )

  const isUSD = displayCurrencyAsset.id === 'USD'

  const [amount, absoluteAmount] = useMemo(() => {
    const coinValue = getCoinValue(coin, prices, assets)

    if (displayCurrency === ORACLE_DENOM) return [coinValue.toNumber(), coinValue.abs().toNumber()]

    const displayDecimals = displayCurrencyAsset.decimals
    const displayPrice = getCoinValue(
      BNCoin.fromDenomAndBigNumber(displayCurrency, BN(1).shiftedBy(displayDecimals)),
      prices,
      assets,
    )

    const amount = coinValue.div(displayPrice).toNumber()

    return [amount, Math.abs(amount)]
  }, [assets, displayCurrency, displayCurrencyAsset.decimals, prices, coin])

  const isLessThanACent = useMemo(
    () => isUSD && absoluteAmount < 0.01 && absoluteAmount > 0,
    [absoluteAmount, isUSD],
  )

  const prefix = useMemo(() => {
    const positiveOrNegativePrefix = showSignPrefix
      ? amount > 0
        ? '+'
        : amount < 0
          ? '-'
          : ''
      : ''
    const approximationPrefix = isApproximation ? '~ ' : ''
    const smallerThanPrefix = isLessThanACent && !showZero ? '< ' : ''

    return isUSD
      ? `${approximationPrefix}${smallerThanPrefix}${positiveOrNegativePrefix}$`
      : `${approximationPrefix}${smallerThanPrefix}${positiveOrNegativePrefix}`
  }, [isUSD, isApproximation, showZero, showSignPrefix, amount, isLessThanACent])

  const suffix = isUSD
    ? ''
    : ` ${displayCurrencyAsset.symbol ? ` ${displayCurrencyAsset.symbol}` : ''}`

  return (
    <FormattedNumber
      className={classNames(
        className,
        parentheses && 'before:content-["("] after:content-[")"]',
        isProfitOrLoss && amount < 0 && 'text-loss',
        isProfitOrLoss && amount > 0 && 'text-profit',
      )}
      amount={isLessThanACent ? 0.01 : absoluteAmount}
      options={{
        minDecimals: isUSD ? 2 : 0,
        maxDecimals: 2,
        abbreviated: true,
        suffix,
        ...options,
        prefix,
      }}
      animate
    />
  )
}

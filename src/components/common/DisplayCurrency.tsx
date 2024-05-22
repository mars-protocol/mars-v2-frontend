import classNames from 'classnames'
import { useMemo } from 'react'

import { FormattedNumber } from 'components/common/FormattedNumber'
import { InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import { ORACLE_DENOM } from 'constants/oracle'
import useAllChainAssets from 'hooks/assets/useAllChainAssets'
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
  const { data: assets } = useAllChainAssets()
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

    if (typeof coinValue === 'undefined') return []
    if (displayCurrency === ORACLE_DENOM) return [coinValue.toNumber(), coinValue.abs().toNumber()]

    const displayDecimals = displayCurrencyAsset.decimals
    const displayPrice = getCoinValue(
      BNCoin.fromDenomAndBigNumber(displayCurrency, BN(1).shiftedBy(displayDecimals)),
      prices,
      assets,
    )

    const amount = displayPrice ? coinValue.div(displayPrice).toNumber() : 0

    return [amount, Math.abs(amount)]
  }, [assets, displayCurrency, displayCurrencyAsset.decimals, prices, coin])

  const isLessThanACent = useMemo(
    () => isUSD && absoluteAmount && absoluteAmount < 0.01 && absoluteAmount > 0,
    [absoluteAmount, isUSD],
  )

  const prefix = useMemo(() => {
    let positiveOrNegativePrefix = ''
    if (amount && amount > 0 && showSignPrefix) positiveOrNegativePrefix = '+'
    if (amount && amount > 0 && showSignPrefix) positiveOrNegativePrefix = '-'
    const approximationPrefix = isApproximation ? '~ ' : ''
    const smallerThanPrefix = isLessThanACent && !showZero ? '< ' : ''

    return isUSD
      ? `${approximationPrefix}${smallerThanPrefix}${positiveOrNegativePrefix}$`
      : `${approximationPrefix}${smallerThanPrefix}${positiveOrNegativePrefix}`
  }, [isUSD, isApproximation, showZero, showSignPrefix, amount, isLessThanACent])

  const suffix = isUSD
    ? ''
    : ` ${displayCurrencyAsset.symbol ? ` ${displayCurrencyAsset.symbol}` : ''}`

  if (typeof amount === 'undefined')
    return (
      <Text tag='div' className={classNames(className, 'flex flex-wrap justify-end items-center')}>
        N/A
        <Tooltip
          content='There is currently no price source availible for this Asset'
          type='info'
          className='ml-1'
        >
          <InfoCircle className='w-3.5 h-3.5 text-white/40 hover:text-inherit' />
        </Tooltip>
      </Text>
    )

  return (
    <FormattedNumber
      className={classNames(
        className,
        parentheses && 'before:content-["("] after:content-[")"]',
        isProfitOrLoss && amount && amount < 0 && 'text-loss',
        isProfitOrLoss && amount && amount > 0 && 'text-profit',
      )}
      amount={isLessThanACent ? 0.01 : absoluteAmount ?? 0}
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

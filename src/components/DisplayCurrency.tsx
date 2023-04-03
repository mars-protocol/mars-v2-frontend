import { Coin } from '@cosmjs/stargate'
import { FormattedNumber } from './FormattedNumber'
import useStore from 'store'
import { getMarketAssets } from 'utils/assets'
import BigNumber from 'bignumber.js'

interface Props {
  coin: Coin
  className?: string
  prefixClassName?: string
  valueClassName?: string
  isApproximation?: boolean
}

export default function DisplayCurrency(props: Props) {
  const displayCurrency = useStore((s) => s.displayCurrency)
  const prices = useStore((s) => s.prices)

  function convertToDisplayAmount(coin: Coin) {
    const price = prices.find((price) => price.denom === coin.denom)
    const asset = getMarketAssets().find((asset) => asset.denom === coin.denom)

    const displayPrice = prices.find((price) => price.denom === displayCurrency.denom)

    if (!price || !asset || !displayPrice) return '0'

    return new BigNumber(coin.amount)
      .times(price.amount)
      .times(displayPrice.amount)
      .integerValue(BigNumber.ROUND_HALF_DOWN)
      .toNumber()
  }

  return (
    <span className={props.className}>
      {displayCurrency.prefix && (
        <span className={props.prefixClassName}>
          {displayCurrency.prefix}
          {props.isApproximation && '~'}
        </span>
      )}
      <span className={props.valueClassName}>
        <FormattedNumber
          amount={convertToDisplayAmount(props.coin)}
          options={{
            minDecimals: 0,
            maxDecimals: 2,
            abbreviated: true,
            decimals: displayCurrency.decimals,
          }}
        />
      </span>
      {displayCurrency.symbol && (
        <span className={props.valueClassName}>{' ' + displayCurrency.symbol}</span>
      )}
    </span>
  )
}

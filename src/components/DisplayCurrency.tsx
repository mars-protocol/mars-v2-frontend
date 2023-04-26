import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'

import useStore from 'store'
import { getMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'

import { FormattedNumber } from './FormattedNumber'

interface Props {
  coin: Coin
  className?: string
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

    return BN(coin.amount)
      .times(price.amount)
      .div(displayPrice.amount)
      .integerValue(BigNumber.ROUND_HALF_DOWN)
      .toNumber()
  }

  return (
    <FormattedNumber
      className={props.className}
      amount={convertToDisplayAmount(props.coin)}
      options={{
        minDecimals: 0,
        maxDecimals: 2,
        abbreviated: true,
        decimals: displayCurrency.decimals,
        prefix: `${props.isApproximation ? '~ ' : ''}${
          displayCurrency.prefix ? displayCurrency.prefix : ''
        }`,
        suffix: displayCurrency.symbol ? ` ${displayCurrency.symbol}` : '',
      }}
    />
  )
}

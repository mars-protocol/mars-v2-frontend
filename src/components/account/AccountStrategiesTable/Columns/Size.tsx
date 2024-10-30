import classNames from 'classnames'
import { useMemo } from 'react'

import { getSizeChangeColor } from 'components/account/AccountStrategiesTable/functions'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { formatAmountToPrecision } from 'utils/formatters'

export const SIZE_META = { header: 'Size', meta: { className: 'w-20 min-w-20' } }

interface Props {
  coins: AccountStrategyRow['coins']
  coinsChange: AccountStrategyRow['coinsChange']
}

const MINIMUM_AMOUNT = 0.0001

export default function Size(props: Props) {
  const { coins, coinsChange } = props
  const color = useMemo(() => getSizeChangeColor(coinsChange), [coinsChange])

  const className = classNames('text-xs text-right w-full', color)

  return (
    <div className='flex flex-wrap'>
      <FormattedSize className={className} coin={coins.primary} />
      {coins.secondary && <FormattedSize className={className} coin={coins.secondary} />}
    </div>
  )
}

type FormattedSizeProps = {
  className: string
  coin: BNCoin
}

function FormattedSize(props: FormattedSizeProps) {
  const assets = useDepositEnabledAssets()
  const asset = useAsset(props.coin.denom)

  const symbol = assets.find(byDenom(props.coin.denom))?.symbol
  const size = props.coin.amount.toString()
  const formattedAmount = formatAmountToPrecision(size, MAX_AMOUNT_DECIMALS)
  const lowAmount = formattedAmount === 0 ? MINIMUM_AMOUNT : Math.max(formattedAmount, MIN_AMOUNT)

  return (
    <FormattedNumber
      className={props.className}
      smallerThanThreshold={formattedAmount < MIN_AMOUNT}
      amount={lowAmount}
      options={{
        abbreviated: true,
        decimals: asset?.decimals,
        maxDecimals: 4,
        minDecimals: 0,
        suffix: ` ${symbol}`,
      }}
    />
  )
}
